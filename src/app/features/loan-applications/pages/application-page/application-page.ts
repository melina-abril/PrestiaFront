import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, timer } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { LoanDraftService } from '../../data-access/loan-draft.service';
import { LoanApplicationsService } from '../../data-access/loan-applications.service';
import { EMPLOYMENT_OPTIONS, EmploymentStatus, LoanApplicationOffersResponse, LoanApplicationRequest, LoanPurpose, PURPOSE_OPTIONS, calculateLoan, repaymentDate } from '../../models/loan-applications.models';

function validDocument(value: string): boolean {
  const document = value.trim().toUpperCase();
  if (!/^(?:\d{8}|[XYZ]\d{7})[A-Z]$/.test(document)) return false;
  const digits = /^[XYZ]/.test(document) ? `${'XYZ'.indexOf(document[0] ?? '')}${document.slice(1, 8)}` : document.slice(0, 8);
  return document[8] === 'TRWAGMYFPDXBNJZSQVHLCKE'[Number(digits) % 23];
}

function validAge(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  if (now.getUTCMonth() < date.getUTCMonth() || (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate())) age--;
  return age >= 18 && age <= 100;
}

function validIban(value: string): boolean {
  const iban = value.replace(/\s/g, '').toUpperCase();
  if (!/^ES\d{22}$/.test(iban)) return false;
  let remainder = 0;
  for (const char of `${iban.slice(4)}${iban.slice(0, 4)}`) {
    const expanded = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of expanded) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

const documentValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => validDocument(String(control.value)) ? null : { document: true };
const ageValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => validAge(String(control.value)) ? null : { age: true };
const ibanValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => validIban(String(control.value)) ? null : { iban: true };
const mobileValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  if (typeof value !== 'object' || value === null || !('mobile' in value) || !('phonePrefix' in value)) return null;
  const mobile = value.mobile;
  return typeof mobile === 'string' && ((value.phonePrefix === '+34' && /^[67]\d{8}$/.test(mobile)) || (value.phonePrefix === '+54' && /^\d{10}$/.test(mobile))) ? null : { mobile: true };
};

@Component({
  selector: 'app-application-page',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe, ErrorAlert],
  templateUrl: './application-page.html',
  styleUrl: './application-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPage {
  private readonly drafts = inject(LoanDraftService);
  private readonly api = inject(LoanApplicationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly initial = this.drafts.draft();
  protected readonly draft = this.drafts.draft;
  protected readonly step = signal(this.initial.step);
  protected readonly steps = ['Tu préstamo', 'Datos personales', 'Ingresos', 'Confirmación', 'Ofertas'];
  protected readonly purposes = PURPOSE_OPTIONS;
  protected readonly employments = EMPLOYMENT_OPTIONS;
  protected readonly amounts = Array.from({ length: 40 }, (_, index) => (index + 1) * 50);
  protected readonly days = Array.from({ length: 84 }, (_, index) => index + 7);
  protected readonly calculation = computed(() => calculateLoan(this.draft().amount, this.draft().termDays, true));
  protected readonly dueDate = computed(() => repaymentDate(this.draft().termDays));
  protected readonly sending = signal(false);
  protected readonly sendError = signal<string | null>(null);
  protected readonly offersState = signal<LoadState<LoanApplicationOffersResponse>>({ status: 'empty' });
  private readonly serverErrors = signal<Record<string, string[]>>({});

  protected readonly form = inject(NonNullableFormBuilder).group({
    amount: [this.initial.amount, [Validators.required, Validators.min(50), Validators.max(2000), Validators.pattern(/^\d*(?:00|50)$/)]],
    termDays: [this.initial.termDays, [Validators.required, Validators.min(7), Validators.max(90)]],
    purpose: [this.initial.purpose, [Validators.required]],
    firstName: [this.initial.firstName, [Validators.required, Validators.maxLength(100)]],
    lastName: [this.initial.lastName, [Validators.required, Validators.maxLength(150)]],
    identityDocument: [this.initial.identityDocument, [Validators.required, documentValidator]],
    birthDate: [this.initial.birthDate, [Validators.required, ageValidator]],
    email: [this.initial.email, [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: inject(NonNullableFormBuilder).group({
      phonePrefix: [this.initial.phonePrefix, [Validators.required]],
      mobile: [this.initial.mobile, [Validators.required]],
    }, { validators: mobileValidator }),
    employmentStatus: [this.initial.employmentStatus, [Validators.required]],
    monthlyIncome: [this.initial.monthlyIncome, [Validators.required, Validators.min(0.01), Validators.max(100000)]],
    monthlyExpenses: [this.initial.monthlyExpenses, [Validators.min(0), Validators.max(100000)]],
    iban: [this.initial.iban, [Validators.required, ibanValidator]],
    privacyTermsAccepted: [this.initial.privacyTermsAccepted, [Validators.requiredTrue]],
    creditCheckAccepted: [this.initial.creditCheckAccepted, [Validators.requiredTrue]],
    marketingAccepted: [this.initial.marketingAccepted],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const value = this.form.getRawValue();
      this.drafts.update({ ...value, ...value.phone, phone: undefined, applicationId: null, idempotencyKey: null });
      this.serverErrors.set({});
      this.sendError.set(null);
    });
    if (this.initial.step === 4 && this.initial.applicationId) this.loadOffers(this.initial.applicationId);
  }

  protected purposeLabel(value: string): string {
    return this.purposes.find((item) => item.value === value)?.label ?? 'Sin seleccionar';
  }

  protected employmentLabel(value: string): string {
    return this.employments.find((item) => item.value === value)?.label ?? 'Sin seleccionar';
  }

  protected errorFor(field: string): string {
    const server = this.serverErrors()[field]?.[0];
    if (server) return server;
    const control = field === 'mobile' ? this.form.controls.phone : this.form.get(field);
    if (!control || !control.touched || control.valid) return '';
    if (field === 'purpose') return 'Elige para qué necesitas el préstamo';
    if (field === 'employmentStatus') return 'Elige tu situación laboral';
    if (field === 'identityDocument') return 'El documento no es un DNI o NIE válido';
    if (field === 'birthDate') return 'Debes tener entre 18 y 100 años';
    if (field === 'email') return 'Ingresa un correo válido';
    if (field === 'mobile') return 'Ingresa un móvil válido';
    if (field === 'iban') return 'El IBAN no es válido';
    if (field === 'monthlyIncome') return 'Ingresa un importe mayor que 0';
    if (field === 'monthlyExpenses') return 'Ingresa un importe entre 0 y 100.000';
    return 'Completa este campo';
  }

  protected next(): void {
    const fields = this.step() === 0 ? ['amount', 'termDays', 'purpose'] :
      this.step() === 1 ? ['firstName', 'lastName', 'identityDocument', 'birthDate', 'email', 'phone'] :
      ['employmentStatus', 'monthlyIncome', 'monthlyExpenses', 'iban'];
    for (const field of fields) this.form.get(field)?.markAllAsTouched();
    const firstInvalid = fields.find((field) => this.form.get(field)?.invalid);
    if (firstInvalid) {
      document.getElementById(firstInvalid === 'phone' ? 'mobile' : firstInvalid)?.focus();
      return;
    }
    this.goTo(this.step() + 1);
  }

  protected goTo(index: number): void {
    if (index < 0 || index > 3) return;
    this.step.set(index);
    this.drafts.update({ step: index });
  }

  protected back(): void {
    this.goTo(this.step() - 1);
  }

  protected modify(): void {
    this.offersState.set({ status: 'empty' });
    this.drafts.update({ applicationId: null, idempotencyKey: null, step: 0 });
    this.step.set(0);
  }

  protected submit(): void {
    if (this.sending() || !this.form.controls.privacyTermsAccepted.value || !this.form.controls.creditCheckAccepted.value) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const invalidStep = [
        ['amount', 'termDays', 'purpose'],
        ['firstName', 'lastName', 'identityDocument', 'birthDate', 'email', 'phone'],
        ['employmentStatus', 'monthlyIncome', 'monthlyExpenses', 'iban'],
      ].findIndex((fields) => fields.some((field) => this.form.get(field)?.invalid));
      if (invalidStep >= 0) this.goTo(invalidStep);
      return;
    }
    const value = this.form.getRawValue();
    const request: LoanApplicationRequest = {
      amount: value.amount, termDays: value.termDays, purpose: value.purpose as LoanPurpose,
      firstName: value.firstName.trim(), lastName: value.lastName.trim(),
      identityDocument: value.identityDocument.trim().toUpperCase(), birthDate: value.birthDate,
      email: value.email.trim().toLowerCase(), phonePrefix: value.phone.phonePrefix,
      mobile: value.phone.mobile.trim(), employmentStatus: value.employmentStatus as EmploymentStatus,
      monthlyIncome: value.monthlyIncome ?? 0, monthlyExpenses: value.monthlyExpenses,
      iban: value.iban.replace(/\s/g, '').toUpperCase(), privacyTermsAccepted: true,
      creditCheckAccepted: true, marketingAccepted: value.marketingAccepted,
    };
    const key = this.draft().idempotencyKey ?? crypto.randomUUID();
    this.drafts.update({ idempotencyKey: key });
    this.sending.set(true);
    this.sendError.set(null);
    this.api.createLoanApplication(request, key).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ id }) => {
        this.sending.set(false);
        this.step.set(4);
        this.drafts.update({ step: 4, applicationId: id });
        this.loadOffers(id);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        if (error instanceof ApiProblemError && Object.keys(error.fieldErrors).length > 0) {
          this.serverErrors.set(error.fieldErrors);
          const groups = [
            ['amount', 'termDays', 'purpose'],
            ['firstName', 'lastName', 'identityDocument', 'birthDate', 'email', 'phonePrefix', 'mobile'],
            ['employmentStatus', 'monthlyIncome', 'monthlyExpenses', 'iban'],
          ];
          const index = groups.findIndex((group) => group.some((field) => error.fieldErrors[field]));
          if (index >= 0) this.goTo(index);
        }
        this.sendError.set(error instanceof ApiProblemError && error.status === 429 ?
          'Hiciste demasiadas solicitudes. Intenta de nuevo más tarde.' :
          error instanceof ApiProblemError && Object.keys(error.fieldErrors).length > 0 ? errorMessage(error) :
          'No pudimos enviar tu solicitud. Intenta de nuevo.');
      },
    });
  }

  protected retryOffers(): void {
    const id = this.draft().applicationId;
    if (id) this.loadOffers(id);
  }

  private loadOffers(id: string): void {
    this.offersState.set({ status: 'loading' });
    combineLatest([this.api.getLoanApplicationOffers(id), timer(2000)]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ([data]) => this.offersState.set(data.offers.length ? { status: 'ready', data } : { status: 'empty' }),
      error: () => this.offersState.set({ status: 'error', message: 'No pudimos obtener tus ofertas.' }),
    });
  }
}
