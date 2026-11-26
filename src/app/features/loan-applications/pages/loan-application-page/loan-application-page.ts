import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { LoanApplicationsService } from '../../data-access/loan-applications.service';
import { LoanVisitService } from '../../data-access/loan-visit.service';
import { calculateLoan } from '../../models/loan-calculation';
import { EMPLOYMENT_OPTIONS, EmploymentStatus, LoanApplicationOffersResponse, LoanApplicationRequest, LoanPurpose, PURPOSE_OPTIONS } from '../../models/loan-applications.models';

function ageValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { age: true };
  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) return { age: true };
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) age--;
  return age >= 18 && age <= 100 ? null : { age: true };
}

function documentValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim().toUpperCase();
  if (!/^(?:\d{8}|[XYZ]\d{7})[A-Z]$/.test(value)) return { document: true };
  const digits = /^[XYZ]/.test(value) ? `${'XYZ'.indexOf(value[0])}${value.slice(1, 8)}` : value.slice(0, 8);
  return value[8] === 'TRWAGMYFPDXBNJZSQVHLCKE'[Number(digits) % 23] ? null : { document: true };
}

function ibanValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.replace(/\s/g, '').toUpperCase();
  if (!/^ES\d{22}$/.test(value)) return { iban: true };
  const rearranged = `${value.slice(4)}${value.slice(0, 4)}`;
  let remainder = 0;
  for (const character of rearranged) {
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1 ? null : { iban: true };
}

const mobileValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  return typeof value === 'string' && /^\d{9,15}$/.test(value.replace(/\s/g, '')) ? null : { mobile: true };
};

@Component({
  selector: 'app-loan-application-page',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe, ErrorAlert, EmptyState, LoadingState],
  templateUrl: './loan-application-page.html',
  styleUrl: './loan-application-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanApplicationPage {
  protected readonly visit = inject(LoanVisitService);
  private readonly service = inject(LoanApplicationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly builder = inject(NonNullableFormBuilder);
  protected readonly purposeOptions = PURPOSE_OPTIONS;
  protected readonly employmentOptions = EMPLOYMENT_OPTIONS;
  protected readonly amounts = Array.from({ length: 40 }, (_, index) => (index + 1) * 50);
  protected readonly days = Array.from({ length: 84 }, (_, index) => index + 7);
  protected readonly labels = ['Tu préstamo', 'Datos personales', 'Ingresos', 'Confirmación', 'Ofertas'];
  protected readonly quote = computed(() => calculateLoan(this.visit.amount(), this.visit.termDays()));
  protected readonly saving = signal(false);
  protected readonly sendError = signal<string | null>(null);
  protected readonly offersState = signal<LoadState<LoanApplicationOffersResponse>>({ status: 'loading' });
  protected readonly analysisStage = signal(0);
  private readonly serverErrors = signal<Record<string, string[]>>({});
  private readonly startedAt = Date.now();

  protected readonly form = this.builder.group({
    amount: [this.visit.amount(), [Validators.required, Validators.min(50), Validators.max(2000)]],
    termDays: [this.visit.termDays(), [Validators.required, Validators.min(7), Validators.max(90)]],
    purpose: [this.visit.draft().purpose as LoanPurpose | '', Validators.required],
    firstName: [this.visit.draft().firstName, [Validators.required, Validators.maxLength(60)]],
    lastName: [this.visit.draft().lastName, [Validators.required, Validators.maxLength(60)]],
    identityDocument: [this.visit.draft().identityDocument, [Validators.required, documentValidator]],
    birthDate: [this.visit.draft().birthDate, [Validators.required, ageValidator]],
    email: [this.visit.draft().email, [Validators.required, Validators.email, Validators.maxLength(254)]],
    phonePrefix: [this.visit.draft().phonePrefix],
    mobile: [this.visit.draft().mobile, [Validators.required, mobileValidator]],
    employmentStatus: [this.visit.draft().employmentStatus as EmploymentStatus | '', Validators.required],
    monthlyIncome: [this.visit.draft().monthlyIncome, [Validators.required, Validators.min(0.01), Validators.max(100000)]],
    monthlyExpenses: [this.visit.draft().monthlyExpenses, [Validators.min(0), Validators.max(100000)]],
    iban: [this.visit.draft().iban, [Validators.required, ibanValidator]],
    privacyTermsAccepted: [this.visit.draft().privacyTermsAccepted, Validators.requiredTrue],
    creditCheckAccepted: [this.visit.draft().creditCheckAccepted, Validators.requiredTrue],
    marketingAccepted: [this.visit.draft().marketingAccepted],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.visit.update(this.form.getRawValue());
      this.serverErrors.set({});
    });
    if (this.visit.step() === 4 && this.visit.applicationId()) this.loadOffers();
    else if (this.visit.step() === 4) this.visit.goTo(0);
  }

  protected errorFor(field: keyof typeof this.form.controls): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return '';
    if (control.hasError('required') || control.hasError('requiredTrue')) return 'Completa este campo';
    if (field === 'identityDocument') return 'El documento no es un DNI o NIE válido';
    if (field === 'birthDate') return 'Debes tener entre 18 y 100 años';
    if (field === 'email') return 'Ingresa un correo válido';
    if (field === 'mobile') return 'Ingresa un móvil válido';
    if (field === 'iban') return 'El IBAN no es válido';
    if (field === 'monthlyIncome') return 'Ingresa un importe mayor que 0';
    if (field === 'monthlyExpenses') return 'Ingresa un importe entre 0 y 100.000';
    return 'Revisa este campo';
  }

  private fieldsFor(step: number): (keyof typeof this.form.controls)[] {
    if (step === 0) return ['amount', 'termDays', 'purpose'];
    if (step === 1) return ['firstName', 'lastName', 'identityDocument', 'birthDate', 'email', 'phonePrefix', 'mobile'];
    if (step === 2) return ['employmentStatus', 'monthlyIncome', 'monthlyExpenses', 'iban'];
    return ['privacyTermsAccepted', 'creditCheckAccepted'];
  }

  protected next(): void {
    const step = this.visit.step();
    const fields = this.fieldsFor(step);
    for (const field of fields) this.form.controls[field].markAsTouched();
    if (step === 0 && !this.form.controls.purpose.value) this.sendError.set('Elige para qué necesitas el préstamo');
    else this.sendError.set(null);
    const firstInvalid = fields.find((field) => this.form.controls[field].invalid);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }
    if (step < 3) this.visit.goTo(step + 1);
  }

  protected back(): void { this.visit.goTo(Math.max(0, this.visit.step() - 1)); }
  protected edit(step: number): void { this.visit.goTo(step); }
  protected modify(): void { this.visit.modify(); this.offersState.set({ status: 'loading' }); }

  protected submit(): void {
    if (this.saving()) return;
    for (let step = 0; step < 4; step++) {
      const fields = this.fieldsFor(step);
      const invalid = fields.find((field) => this.form.controls[field].invalid);
      if (invalid) {
        this.form.controls[invalid].markAsTouched();
        this.visit.goTo(step);
        queueMicrotask(() => document.getElementById(`field-${invalid}`)?.focus());
        return;
      }
    }
    const value = this.form.getRawValue();
    const request: LoanApplicationRequest = {
      ...value,
      purpose: value.purpose as LoanPurpose,
      employmentStatus: value.employmentStatus as EmploymentStatus,
      firstName: value.firstName.trim(), lastName: value.lastName.trim(),
      identityDocument: value.identityDocument.trim().toUpperCase(),
      email: value.email.trim().toLowerCase(), mobile: value.mobile.replace(/\s/g, ''),
      monthlyIncome: Number(value.monthlyIncome),
      monthlyExpenses: value.monthlyExpenses === null ? null : Number(value.monthlyExpenses),
      iban: value.iban.replace(/\s/g, '').toUpperCase(),
      privacyTermsAccepted: true, creditCheckAccepted: true,
    };
    this.saving.set(true);
    this.sendError.set(null);
    this.service.createLoanApplication(request, this.visit.submissionKey()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => { this.saving.set(false); this.visit.saved(id); this.loadOffers(); },
      error: (error: unknown) => {
        this.saving.set(false);
        if (error instanceof ApiProblemError) {
          this.serverErrors.set(error.fieldErrors);
          const invalid = Object.keys(error.fieldErrors)[0];
          const fieldStep = [0, 1, 2, 3].find((step) => this.fieldsFor(step).some((field) => field === invalid));
          if (fieldStep !== undefined) this.visit.goTo(fieldStep);
        }
        this.sendError.set(error instanceof ApiProblemError && error.status === 429
          ? 'Hiciste demasiadas solicitudes. Intenta de nuevo más tarde.'
          : 'No pudimos enviar tu solicitud. Intenta de nuevo.');
      },
    });
  }

  protected loadOffers(): void {
    const id = this.visit.applicationId();
    if (!id) return;
    this.offersState.set({ status: 'loading' });
    this.analysisStage.set(1);
    timer(700).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.analysisStage.set(2));
    forkJoin([this.service.getLoanApplicationOffers(id), timer(2000)]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ([data]) => {
        this.analysisStage.set(3);
        this.offersState.set(data.offers.length ? { status: 'ready', data } : { status: 'empty' });
      },
      error: (error: unknown) => this.offersState.set({ status: 'error', message: errorMessage(error) }),
    });
  }

  protected safeWebsite(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' ? parsed.href : null;
    } catch { return null; }
  }

  protected employmentLabel(value: EmploymentStatus | ''): string {
    return this.employmentOptions.find((option) => option.value === value)?.label ?? '';
  }
}
