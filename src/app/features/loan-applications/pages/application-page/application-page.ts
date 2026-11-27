import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { SimulationSession } from '../../../loan-common/simulation-session.service';
import { calculateLoan } from '../../../loan-common/loan-calculation';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoanApplicationsService } from '../../data-access/loan-applications.service';
import { ApplicationOfferResponse, ApplicationOffersResponse, ApplicationRequest, AsnefStatus, EMPLOYMENT_OPTIONS, EmploymentStatus } from '../../models/loan-applications.models';

type Field = 'name' | 'birthDate' | 'mobile' | 'email' | 'employmentStatus' | 'asnefStatus' | 'privacyAccepted';
type Stage = 'form' | 'analysis' | 'offers' | 'empty' | 'offer-error';
type SavedForm = { name: string; birthDate: string; mobile: string; email: string; employmentStatus: EmploymentStatus | ''; asnefStatus: AsnefStatus | ''; privacyAccepted: boolean; marketingAccepted: boolean };

function validAge(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  if (today.toISOString().slice(5, 10) < value.slice(5, 10)) age--;
  return age >= 18 && age <= 100;
}

@Component({
  selector: 'app-application-page',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, ErrorAlert],
  templateUrl: './application-page.html',
  styleUrl: './application-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPage implements OnDestroy {
  private readonly service = inject(LoanApplicationsService);
  private readonly simulation = inject(SimulationSession);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'credara.application-form';
  private readonly idempotencyKey = globalThis.crypto.randomUUID();
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private readonly serverErrors = signal<Record<string, string[]>>({});
  private readonly selection = this.simulation.load(this.simulation.homeDefaults);

  protected readonly loan = computed(() => calculateLoan(this.selection.amount, this.selection.termDays));
  protected readonly employmentOptions = EMPLOYMENT_OPTIONS;
  protected readonly stage = signal<Stage>('form');
  protected readonly saving = signal(false);
  protected readonly progress = signal(0);
  protected readonly submitError = signal<string | null>(null);
  protected readonly offerError = signal<string | null>(null);
  protected readonly applicationId = signal<string | null>(null);
  protected readonly offers = signal<ApplicationOfferResponse[]>([]);
  protected readonly visited = signal<readonly string[]>([]);
  protected readonly clicking = signal<string | null>(null);
  protected readonly clickError = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/^[\p{L} '-]{2,60}$/u)]],
    birthDate: ['', [Validators.required, (control) => validAge(control.value as string) ? null : { age: true }]],
    mobile: ['', [Validators.required, Validators.pattern(/^[67]\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    employmentStatus: ['' as EmploymentStatus | '', Validators.required],
    asnefStatus: ['' as AsnefStatus | '', Validators.required],
    privacyAccepted: [false, Validators.requiredTrue],
    marketingAccepted: [false],
  });

  constructor() {
    this.restoreForm();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.serverErrors.set({});
      try { sessionStorage.setItem(this.storageKey, JSON.stringify(this.form.getRawValue())); } catch { /* Almacenamiento no disponible. */ }
    });
  }

  ngOnDestroy(): void {
    this.stopProgress();
  }

  protected errorFor(field: Field): string {
    const serverError = this.serverErrors()[field]?.[0];
    if (serverError) return serverError;
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return '';
    if (field === 'privacyAccepted') return 'Debes aceptar la Política de privacidad y los Términos.';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (field === 'name') return 'El nombre debe tener entre 2 y 60 caracteres y solo letras, espacios, apóstrofos o guiones.';
    if (field === 'birthDate') return 'Debes tener entre 18 y 100 años.';
    if (field === 'mobile') return 'Introduce un móvil español de 9 dígitos.';
    return 'Introduce un correo válido.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const values = this.form.getRawValue();
    if (!values.employmentStatus || !values.asnefStatus || !values.privacyAccepted) return;
    const request: ApplicationRequest = {
      amount: this.selection.amount, termDays: this.selection.termDays,
      name: values.name.trim(), birthDate: values.birthDate, mobile: values.mobile,
      email: values.email.trim(), employmentStatus: values.employmentStatus,
      asnefStatus: values.asnefStatus, privacyAccepted: true, marketingAccepted: values.marketingAccepted,
    };
    this.saving.set(true);
    this.submitError.set(null);
    this.service.createApplication(request, this.idempotencyKey).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => {
        this.saving.set(false);
        this.applicationId.set(id);
        this.startAnalysis(id);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        if (error instanceof ApiProblemError) this.serverErrors.set(error.fieldErrors);
        this.submitError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Has hecho demasiadas solicitudes. Inténtalo más tarde.'
          : 'No pudimos enviar tu solicitud. Inténtalo de nuevo.');
        if (error instanceof ApiProblemError && Object.keys(error.fieldErrors).length) {
          this.form.markAllAsTouched();
          setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        }
      },
    });
  }

  private startAnalysis(id: string): void {
    this.stage.set('analysis');
    this.progress.set(0);
    this.progressTimer = setInterval(() => this.progress.update((step) => Math.min(step + 1, 3)), 1000);
    forkJoin({ result: this.service.getApplicationOffers(id), minimum: timer(3000) })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ result }) => { this.stopProgress(); this.showOffers(result); },
        error: () => { this.stopProgress(); this.offerError.set('No pudimos cargar tus ofertas.'); this.stage.set('offer-error'); },
      });
  }

  protected retryOffers(): void {
    const id = this.applicationId();
    if (!id) return;
    this.stage.set('analysis');
    this.progress.set(0);
    this.startAnalysis(id);
  }

  private showOffers(result: ApplicationOffersResponse): void {
    const sorted = [...result.offers].sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes);
    this.offers.set(sorted);
    this.stage.set(result.status === 'SIN_OFERTAS' || sorted.length === 0 ? 'empty' : 'offers');
  }

  private stopProgress(): void {
    if (this.progressTimer !== null) clearInterval(this.progressTimer);
    this.progressTimer = null;
  }

  protected responseTime(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 6) / 10}`.replace('.', ',') + ' h';
  }

  protected visit(offer: ApplicationOfferResponse): void {
    const id = this.applicationId();
    if (!id || this.clicking()) return;
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    this.clicking.set(offer.lenderId);
    this.clickError.set(null);
    this.service.recordOfferClick(id, offer.lenderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ url }) => {
        this.clicking.set(null);
        this.visited.update((current) => current.includes(offer.lenderId) ? current : [...current, offer.lenderId]);
        if (tab && !tab.closed) tab.location.replace(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        tab?.close();
        this.clicking.set(null);
        this.clickError.set('No pudimos abrir la entidad. Inténtalo de nuevo.');
      },
    });
  }

  private restoreForm(): void {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) return;
      const value: unknown = JSON.parse(stored);
      if (typeof value !== 'object' || value === null || !('name' in value) || typeof value.name !== 'string') return;
      const saved = value as Partial<SavedForm>;
      this.form.patchValue({
        name: saved.name, birthDate: typeof saved.birthDate === 'string' ? saved.birthDate : '',
        mobile: typeof saved.mobile === 'string' ? saved.mobile : '',
        email: typeof saved.email === 'string' ? saved.email : '',
        employmentStatus: this.employmentOptions.some((option) => option.value === saved.employmentStatus) ? saved.employmentStatus : '',
        asnefStatus: saved.asnefStatus === 'NO' || saved.asnefStatus === 'SI' || saved.asnefStatus === 'NO_SE' ? saved.asnefStatus : '',
        privacyAccepted: saved.privacyAccepted === true,
        marketingAccepted: saved.marketingAccepted === true,
      }, { emitEvent: false });
    } catch { /* Los datos de sesión pueden estar deshabilitados o corruptos. */ }
  }
}
