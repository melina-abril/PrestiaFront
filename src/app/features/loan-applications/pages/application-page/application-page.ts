import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { LoanSimulationStore } from '../../../loan-simulator/shared/loan-simulation-store';
import { calculateLoan } from '../../../loan-simulator/shared/loan-calculation';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { LoanApplicationsService } from '../../data-access/loan-applications.service';
import { ApplicationOfferResponse, ApplicationOffersResponse, ApplicationRequest, ASNEF_OPTIONS, AsnefStatus, EMPLOYMENT_OPTIONS, EmploymentStatus } from '../../models/loan-applications.models';

const STORAGE_KEY = 'credara.solicitud.datos';

type FormData = {
  name: string;
  birthDate: string;
  mobile: string;
  email: string;
  employmentStatus: EmploymentStatus | '';
  asnefStatus: AsnefStatus | '';
  privacyAccepted: boolean;
  marketingAccepted: boolean;
};
type FieldName = keyof FormData;

function readForm(): FormData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const data = value as Record<string, unknown>;
    if (typeof data['name'] !== 'string' || typeof data['birthDate'] !== 'string' ||
      typeof data['mobile'] !== 'string' || typeof data['email'] !== 'string' ||
      typeof data['employmentStatus'] !== 'string' || typeof data['asnefStatus'] !== 'string' ||
      typeof data['privacyAccepted'] !== 'boolean' || typeof data['marketingAccepted'] !== 'boolean') return null;
    const employment = EMPLOYMENT_OPTIONS.find((option) => option.value === data['employmentStatus']);
    const asnef = ASNEF_OPTIONS.find((option) => option.value === data['asnefStatus']);
    return {
      name: data['name'], birthDate: data['birthDate'], mobile: data['mobile'], email: data['email'],
      employmentStatus: employment?.value ?? '', asnefStatus: asnef?.value ?? '',
      privacyAccepted: data['privacyAccepted'], marketingAccepted: data['marketingAccepted'],
    };
  } catch {
    return null;
  }
}

function validAge(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  if (now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate())) age--;
  return age >= 18 && age <= 100;
}

@Component({
  selector: 'app-application-page',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, ErrorAlert],
  templateUrl: './application-page.html',
  styleUrl: './application-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPage {
  private readonly service = inject(LoanApplicationsService);
  private readonly store = inject(LoanSimulationStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly builder = inject(NonNullableFormBuilder);
  private readonly savedForm = readForm();
  private readonly idempotencyKey = crypto.randomUUID();
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private progressFinished = false;
  private readonly serverErrors = signal<Record<string, string[]>>({});

  protected readonly employmentOptions = EMPLOYMENT_OPTIONS;
  protected readonly asnefOptions = ASNEF_OPTIONS;
  protected readonly simulation = computed(() => this.store.simulation() ?? { amount: 300, termDays: 30 });
  protected readonly calculation = computed(() => calculateLoan(this.simulation().amount, this.simulation().termDays));
  protected readonly form = this.builder.group({
    name: [this.savedForm?.name ?? '', [Validators.required, Validators.pattern(/^[\p{L} '-]{2,60}$/u)]],
    birthDate: [this.savedForm?.birthDate ?? '', [Validators.required, (control) => validAge(control.value as string) ? null : { age: true }]],
    mobile: [this.savedForm?.mobile ?? '', [Validators.required, Validators.pattern(/^[67]\d{8}$/)]],
    email: [this.savedForm?.email ?? '', [Validators.required, Validators.email]],
    employmentStatus: [this.savedForm?.employmentStatus ?? '' as EmploymentStatus | '', Validators.required],
    asnefStatus: [this.savedForm?.asnefStatus ?? '' as AsnefStatus | '', Validators.required],
    privacyAccepted: [this.savedForm?.privacyAccepted ?? false, Validators.requiredTrue],
    marketingAccepted: [this.savedForm?.marketingAccepted ?? false],
  });
  protected readonly phase = signal<'form' | 'analysis' | 'offers'>('form');
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly offerState = signal<LoadState<ApplicationOffersResponse>>({ status: 'loading' });
  protected readonly progressStep = signal(0);
  protected readonly applicationId = signal<string | null>(null);
  protected readonly visiting = signal<string | null>(null);
  protected readonly clickError = signal<string | null>(null);
  protected readonly visited = signal<ReadonlySet<string>>(new Set<string>());

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.serverErrors.set({});
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.form.getRawValue())); } catch { /* Almacenamiento no disponible. */ }
    });
    this.destroyRef.onDestroy(() => this.stopProgress());
  }

  protected errorFor(field: FieldName): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = this.form.controls[field];
    if (!control.touched || !control.invalid) return '';
    if (field === 'privacyAccepted') return 'Debes aceptar la Política de privacidad y los Términos.';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (field === 'name') return 'El nombre debe tener entre 2 y 60 caracteres y solo letras, espacios, apóstrofos o guiones.';
    if (field === 'birthDate') return 'Debes tener entre 18 y 100 años.';
    if (field === 'mobile') return 'Introduce un móvil español de 9 dígitos.';
    if (field === 'email') return 'Introduce un correo válido.';
    return 'Revisa este campo.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    if (this.saving()) return;
    const value = this.form.getRawValue();
    const loan = this.simulation();
    const request: ApplicationRequest = {
      amount: loan.amount, termDays: loan.termDays, name: value.name.trim(),
      birthDate: value.birthDate, mobile: value.mobile, email: value.email.trim(),
      employmentStatus: value.employmentStatus as EmploymentStatus,
      asnefStatus: value.asnefStatus as AsnefStatus,
      privacyAccepted: true, marketingAccepted: value.marketingAccepted,
    };
    this.saving.set(true);
    this.submitError.set(null);
    this.service.createApplication(request, this.idempotencyKey).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => {
        this.saving.set(false);
        this.applicationId.set(id);
        this.phase.set('analysis');
        this.startProgress();
        this.loadOffers(id);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.submitError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Has hecho demasiadas solicitudes. Inténtalo más tarde.'
          : 'No pudimos enviar tu solicitud. Inténtalo de nuevo.');
        if (error instanceof ApiProblemError) this.serverErrors.set(error.fieldErrors);
        if (error instanceof ApiProblemError && Object.keys(error.fieldErrors).length) {
          this.form.markAllAsTouched();
          this.focusFirstInvalid();
        }
      },
    });
  }

  private focusFirstInvalid(): void {
    const first = (Object.keys(this.form.controls) as FieldName[]).find((field) =>
      this.form.controls[field].invalid || Boolean(this.serverErrors()[field]?.length));
    if (first) document.getElementById(`application-${first}`)?.focus();
  }

  private startProgress(): void {
    this.progressFinished = false;
    this.progressStep.set(0);
    this.stopProgress();
    this.progressTimer = setInterval(() => {
      const step = this.progressStep() + 1;
      this.progressStep.set(step);
      if (step >= 3) {
        this.stopProgress();
        this.progressFinished = true;
        this.finishAnalysis();
      }
    }, 1000);
  }

  private stopProgress(): void {
    if (this.progressTimer !== null) clearInterval(this.progressTimer);
    this.progressTimer = null;
  }

  private finishAnalysis(): void {
    if (this.progressFinished && this.offerState().status !== 'loading') this.phase.set('offers');
  }

  private loadOffers(id: string): void {
    this.offerState.set({ status: 'loading' });
    this.service.getApplicationOffers(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.offerState.set(response.offers.length ? { status: 'ready', data: response } : { status: 'empty' });
        this.finishAnalysis();
      },
      error: () => {
        this.offerState.set({ status: 'error', message: 'No pudimos cargar tus ofertas.' });
        this.finishAnalysis();
      },
    });
  }

  protected retryOffers(): void {
    const id = this.applicationId();
    if (!id) return;
    this.phase.set('analysis');
    this.loadOffers(id);
  }

  protected sortedOffers(offers: readonly ApplicationOfferResponse[]): ApplicationOfferResponse[] {
    return [...offers].sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name));
  }

  protected responseTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round(minutes / 6) / 10;
    return `${String(hours).replace('.', ',')} h`;
  }

  protected visit(lenderId: string): void {
    const id = this.applicationId();
    if (!id || this.visiting()) return;
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    this.visiting.set(lenderId);
    this.clickError.set(null);
    this.service.recordOfferClick(id, lenderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ url }) => {
        this.visiting.set(null);
        if (!url.startsWith('https://')) {
          tab?.close();
          this.clickError.set('No pudimos abrir la entidad. Inténtalo de nuevo.');
          return;
        }
        this.visited.update((current) => new Set([...current, lenderId]));
        if (tab) tab.location.href = url;
        else window.open(url, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        tab?.close();
        this.visiting.set(null);
        this.clickError.set('No pudimos abrir la entidad. Inténtalo de nuevo.');
      },
    });
  }
}
