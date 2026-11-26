import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, take, timer } from 'rxjs';
import { calculateLoan } from '../../../../common/loan-calculation';
import { SimulationState } from '../../../../common/simulation-state';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ASNEF_OPTIONS, AsnefAnswer, EMPLOYMENT_OPTIONS, EmploymentStatus, LoanOfferResponse, LoanRequestInput } from '../../models/loan-requests.models';
import { LoanRequestsService } from '../../data-access/loan-requests.service';
import { LoadState } from '../../../../shared/models/load-state';

const FORM_KEY = 'credara.solicitud.datos';

function validBirthDate(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { age: true };
  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) return { age: true };
  const today = new Date();
  const years = today.getUTCFullYear() - birth.getUTCFullYear() - (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate()) ? 1 : 0);
  return years >= 18 && years <= 100 ? null : { age: true };
}

interface SavedFields {
  name: string; birthDate: string; mobile: string; email: string;
  employmentStatus: EmploymentStatus | ''; asnef: AsnefAnswer | '';
  acceptsPrivacy: boolean; acceptsCommunications: boolean;
}

function readFields(): Partial<SavedFields> {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const fields = parsed as Record<string, unknown>;
    return {
      name: typeof fields['name'] === 'string' ? fields['name'] : '',
      birthDate: typeof fields['birthDate'] === 'string' ? fields['birthDate'] : '',
      mobile: typeof fields['mobile'] === 'string' ? fields['mobile'] : '',
      email: typeof fields['email'] === 'string' ? fields['email'] : '',
      employmentStatus: EMPLOYMENT_OPTIONS.some((option) => option.value === fields['employmentStatus']) ? fields['employmentStatus'] as EmploymentStatus : '',
      asnef: ASNEF_OPTIONS.some((option) => option.value === fields['asnef']) ? fields['asnef'] as AsnefAnswer : '',
      acceptsPrivacy: fields['acceptsPrivacy'] === true,
      acceptsCommunications: fields['acceptsCommunications'] === true,
    };
  } catch { return {}; }
}

@Component({
  selector: 'app-loan-request-page',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './loan-request-page.html',
  styleUrl: './loan-request-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanRequestPage {
  private readonly service = inject(LoanRequestsService);
  private readonly simulation = inject(SimulationState);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly selection = this.simulation.getSelection(300, 30);
  protected readonly calculation = computed(() => calculateLoan(this.selection.amount, this.selection.days));
  protected readonly employmentOptions = EMPLOYMENT_OPTIONS;
  protected readonly asnefOptions = ASNEF_OPTIONS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/^[\p{L} '-]{2,60}$/u)]],
    birthDate: ['', [Validators.required, validBirthDate]],
    mobile: ['', [Validators.required, Validators.pattern(/^[67]\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    employmentStatus: ['' as EmploymentStatus | '', Validators.required],
    asnef: ['' as AsnefAnswer | '', Validators.required],
    acceptsPrivacy: [false, Validators.requiredTrue],
    acceptsCommunications: [false],
  });
  protected readonly stage = signal<'form' | 'analysis' | 'offers'>('form');
  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly offersState = signal<LoadState<LoanOfferResponse[]>>({ status: 'loading' });
  protected readonly progress = signal(0);
  protected readonly visited = signal<ReadonlySet<string>>(new Set<string>());
  protected readonly opening = signal<string | null>(null);
  protected readonly clickError = signal('');
  private readonly serverErrors = signal<Record<string, string[]>>({});
  private readonly idempotencyKey = signal(this.newKey());
  private requestId: string | null = null;

  constructor() {
    this.form.patchValue(readFields());
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.serverErrors.set({});
      try { sessionStorage.setItem(FORM_KEY, JSON.stringify(this.form.getRawValue())); } catch { /* Almacenamiento opcional. */ }
    });
  }

  protected errorFor(field: keyof SavedFields): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) return '';
    if (field === 'name' && control.hasError('pattern')) return 'El nombre debe tener entre 2 y 60 caracteres y solo letras, espacios, apóstrofos o guiones.';
    if (field === 'birthDate' && control.hasError('age')) return 'Debes tener entre 18 y 100 años.';
    if (field === 'mobile' && control.hasError('pattern')) return 'Introduce un móvil español de 9 dígitos.';
    if (field === 'email' && control.hasError('email')) return 'Introduce un correo válido.';
    if (field === 'acceptsPrivacy') return 'Debes aceptar la Política de privacidad y los Términos.';
    return 'Este campo es obligatorio.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = Object.entries(this.form.controls).find(([, control]) => control.invalid);
      if (first) document.getElementById(`request-${first[0]}`)?.focus();
      return;
    }
    const value = this.form.getRawValue();
    const input: LoanRequestInput = {
      amount: this.selection.amount, termDays: this.selection.days,
      name: value.name.trim(), birthDate: value.birthDate, mobile: value.mobile,
      email: value.email.trim().toLowerCase(),
      employmentStatus: value.employmentStatus as EmploymentStatus,
      asnef: value.asnef as AsnefAnswer,
      acceptsPrivacy: true, acceptsCommunications: value.acceptsCommunications,
    };
    this.submitting.set(true);
    this.submitError.set('');
    this.service.createLoanRequest(input, this.idempotencyKey()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => { this.submitting.set(false); this.requestId = id; this.loadOffers(); },
      error: (error: unknown) => {
        this.submitting.set(false);
        if (error instanceof ApiProblemError) {
          this.serverErrors.set(error.fieldErrors);
          this.form.markAllAsTouched();
        }
        this.submitError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Has hecho demasiadas solicitudes. Inténtalo más tarde.'
          : 'No pudimos enviar tu solicitud. Inténtalo de nuevo.');
      },
    });
  }

  protected retryOffers(): void { this.loadOffers(); }

  private loadOffers(): void {
    const id = this.requestId;
    if (!id) return;
    this.progress.set(0);
    this.offersState.set({ status: 'loading' });
    this.stage.set('analysis');
    timer(1000, 1000).pipe(take(3), takeUntilDestroyed(this.destroyRef)).subscribe((step) => this.progress.set(step + 1));
    forkJoin({ offers: this.service.getLoanRequestOffers(id), minimumTime: timer(3000) })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ offers }) => {
          const sorted = [...offers].sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name, 'es'));
          this.offersState.set(sorted.length ? { status: 'ready', data: sorted } : { status: 'empty' });
          this.stage.set('offers');
        },
        error: () => { this.offersState.set({ status: 'error', message: 'No pudimos cargar tus ofertas.' }); this.stage.set('offers'); },
      });
  }

  protected responseTime(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60 * 10) / 10}`.replace('.', ',') + ' h';
  }

  protected openOffer(lenderId: string): void {
    const id = this.requestId;
    if (!id || this.opening()) return;
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    this.opening.set(lenderId);
    this.clickError.set('');
    this.service.recordOfferClick(id, lenderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ url }) => {
        this.opening.set(null);
        this.visited.update((current) => new Set([...current, lenderId]));
        if (tab) tab.location.href = url;
        else window.open(url, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        tab?.close();
        this.opening.set(null);
        this.clickError.set('No pudimos abrir la entidad. Inténtalo de nuevo.');
      },
    });
  }

  private newKey(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `request_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}
