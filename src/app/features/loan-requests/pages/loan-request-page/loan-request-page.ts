import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LoanSimulationService } from '../../data-access/loan-simulation.service';
import { LoanRequestsService } from '../../data-access/loan-requests.service';
import { ASNEF_OPTIONS, EMPLOYMENT_OPTIONS, AsnefAnswer, EmploymentStatus, LoanOfferResponse, LoanRequestInput } from '../../models/loan-requests.models';
import { displaySimulation } from '../../models/simulation-display';

type FormField = 'name' | 'birthDate' | 'mobile' | 'email' | 'employmentStatus' | 'asnef' | 'acceptsPrivacy' | 'acceptsCommunications';
type Stage = 'form' | 'analysis' | 'offers';

@Component({
  selector: 'app-loan-request-page',
  imports: [ReactiveFormsModule, RouterLink, MoneyPipe, DatePipe, ErrorAlert],
  templateUrl: './loan-request-page.html',
  styleUrl: './loan-request-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanRequestPage {
  private readonly service = inject(LoanRequestsService);
  private readonly simulationService = inject(LoanSimulationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storedSimulation = this.simulationService.get();
  protected readonly simulation = displaySimulation(this.storedSimulation?.amount ?? 300, this.storedSimulation?.days ?? 30);
  protected readonly employmentOptions = EMPLOYMENT_OPTIONS;
  protected readonly asnefOptions = ASNEF_OPTIONS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/^[\p{L} '-]{2,60}$/u)]],
    birthDate: ['', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern(/^[67]\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    employmentStatus: ['' as EmploymentStatus | '', Validators.required],
    asnef: ['' as AsnefAnswer | '', Validators.required],
    acceptsPrivacy: [false, Validators.requiredTrue],
    acceptsCommunications: [false],
  });
  protected readonly stage = signal<Stage>('form');
  protected readonly saving = signal(false);
  protected readonly submissionError = signal<string | null>(null);
  protected readonly offersError = signal<string | null>(null);
  protected readonly clickError = signal<string | null>(null);
  protected readonly visiting = signal<string | null>(null);
  protected readonly visited = signal<readonly string[]>([]);
  protected readonly progress = signal(0);
  private readonly serverErrors = signal<Record<string, string[]>>({});
  private readonly requestId = signal<string | null>(null);
  private readonly retryCount = signal(0);
  private readonly offersRequest = computed(() => ({ id: this.requestId(), retry: this.retryCount() }));
  protected readonly offersState = toSignal(
    toObservable(this.offersRequest).pipe(switchMap(({ id }): Observable<LoadState<LoanOfferResponse[]>> =>
      id ? toLoadState(this.service.getLoanRequestOffers(id)) : of<LoadState<LoanOfferResponse[]>>({ status: 'empty' })
    )),
    { initialValue: { status: 'empty' } as LoadState<LoanOfferResponse[]> },
  );
  protected readonly orderedOffers = computed(() => {
    const state = this.offersState();
    return state.status === 'ready' ? [...state.data].sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name, 'es')) : [];
  });

  constructor() {
    try {
      const stored = sessionStorage.getItem('credara.solicitud.datos');
      if (stored) {
        const data: unknown = JSON.parse(stored);
        if (typeof data === 'object' && data !== null) {
          const values = data as Record<string, unknown>;
          this.form.patchValue({
            name: typeof values['name'] === 'string' ? values['name'] : '',
            birthDate: typeof values['birthDate'] === 'string' ? values['birthDate'] : '',
            mobile: typeof values['mobile'] === 'string' ? values['mobile'] : '',
            email: typeof values['email'] === 'string' ? values['email'] : '',
            employmentStatus: EMPLOYMENT_OPTIONS.find((option) => option.value === values['employmentStatus'])?.value ?? '',
            asnef: ASNEF_OPTIONS.find((option) => option.value === values['asnef'])?.value ?? '',
            acceptsPrivacy: values['acceptsPrivacy'] === true,
            acceptsCommunications: values['acceptsCommunications'] === true,
          });
        }
      }
    } catch {
      // La visita puede tener el almacenamiento deshabilitado.
    }
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.serverErrors.set({});
      try {
        sessionStorage.setItem('credara.solicitud.datos', JSON.stringify(this.form.getRawValue()));
      } catch {
        // El formulario sigue disponible sin almacenamiento.
      }
    });
  }

  protected errorFor(field: FormField): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (field === 'birthDate' && control.value) {
      const value = this.form.controls.birthDate.value;
      const date = new Date(`${value}T00:00:00Z`);
      const now = new Date();
      const age = now.getUTCFullYear() - date.getUTCFullYear() - (now.getUTCMonth() < date.getUTCMonth() || (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate()) ? 1 : 0);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || age < 18 || age > 100) return 'Debes tener entre 18 y 100 años.';
    }
    if (control.valid) return '';
    if (field === 'name' && control.hasError('pattern')) return 'El nombre debe tener entre 2 y 60 caracteres y solo letras, espacios, apóstrofos o guiones.';
    if (field === 'email' && control.hasError('email')) return 'Introduce un correo válido.';
    if (field === 'mobile' && control.hasError('pattern')) return 'Introduce un móvil español de 9 dígitos.';
    if (field === 'acceptsPrivacy') return 'Debes aceptar la Política de privacidad y los Términos.';
    return 'Este campo es obligatorio.';
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    const fields: FormField[] = ['name', 'birthDate', 'mobile', 'email', 'employmentStatus', 'asnef', 'acceptsPrivacy'];
    const firstInvalid = fields.find((field) => !!this.errorFor(field));
    if (firstInvalid || this.form.invalid) {
      if (firstInvalid) document.getElementById(`request-${firstInvalid}`)?.focus();
      return;
    }
    const values = this.form.getRawValue();
    const input: LoanRequestInput = {
      amount: this.simulation.amount, termDays: this.simulation.days,
      name: values.name.trim(), birthDate: values.birthDate, mobile: values.mobile,
      email: values.email.trim().toLowerCase(),
      employmentStatus: values.employmentStatus as EmploymentStatus,
      asnef: values.asnef as AsnefAnswer,
      acceptsPrivacy: true, acceptsCommunications: values.acceptsCommunications,
    };
    const fingerprint = JSON.stringify(input);
    let key = '';
    try {
      const saved = sessionStorage.getItem('credara.solicitud.idempotencia');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null && 'fingerprint' in parsed && 'key' in parsed && parsed.fingerprint === fingerprint && typeof parsed.key === 'string') key = parsed.key;
      }
    } catch {
      // Se genera una clave nueva si la sesión no está disponible.
    }
    if (!key) key = crypto.randomUUID();
    try {
      sessionStorage.setItem('credara.solicitud.idempotencia', JSON.stringify({ fingerprint, key }));
    } catch {
      // La clave se mantiene durante este envío.
    }
    this.saving.set(true);
    this.submissionError.set(null);
    this.service.createLoanRequest(input, key).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.stage.set('analysis');
        this.progress.set(0);
        this.requestId.set(result.id);
        const started = Date.now();
        const timer = window.setInterval(() => {
          this.progress.set(Math.min(3, Math.floor((Date.now() - started) / 1000)));
          const state = this.offersState();
          if (Date.now() - started >= 3000 && state.status !== 'loading' && state.status !== 'empty') {
            window.clearInterval(timer);
            this.stage.set('offers');
          }
        }, 100);
        this.destroyRef.onDestroy(() => window.clearInterval(timer));
      },
      error: (error: unknown) => {
        this.saving.set(false);
        if (error instanceof ApiProblemError) this.serverErrors.set(error.fieldErrors);
        const status = error instanceof ApiProblemError ? error.status : 0;
        this.submissionError.set(status === 429 ? 'Has hecho demasiadas solicitudes. Inténtalo más tarde.' : status === 400 ? errorMessage(error) : 'No pudimos enviar tu solicitud. Inténtalo de nuevo.');
      },
    });
  }

  protected retryOffers(): void {
    this.offersError.set(null);
    this.retryCount.update((count) => count + 1);
  }

  protected openLender(lenderId: string): void {
    const id = this.requestId();
    if (!id || this.visiting()) return;
    const destination = window.open('about:blank', '_blank');
    if (destination) destination.opener = null;
    this.visiting.set(lenderId);
    this.clickError.set(null);
    this.service.recordOfferClick(id, lenderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ url }) => {
        this.visiting.set(null);
        this.visited.update((items) => items.includes(lenderId) ? items : [...items, lenderId]);
        if (destination) destination.location.replace(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
      },
      error: () => {
        destination?.close();
        this.visiting.set(null);
        this.clickError.set('No pudimos abrir la entidad. Inténtalo de nuevo.');
      },
    });
  }

  protected responseTime(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 6) / 10}`.replace('.', ',') + ' h';
  }
}
