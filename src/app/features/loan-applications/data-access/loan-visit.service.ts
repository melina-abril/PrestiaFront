import { Injectable, computed, signal } from '@angular/core';
import { EmploymentStatus, LoanPurpose } from '../models/loan-applications.models';

export interface LoanDraft {
  amount: number;
  termDays: number;
  purpose: LoanPurpose | '';
  firstName: string;
  lastName: string;
  identityDocument: string;
  birthDate: string;
  email: string;
  phonePrefix: string;
  mobile: string;
  employmentStatus: EmploymentStatus | '';
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  iban: string;
  privacyTermsAccepted: boolean;
  creditCheckAccepted: boolean;
  marketingAccepted: boolean;
}

const INITIAL_DRAFT: LoanDraft = {
  amount: 500, termDays: 30, purpose: '', firstName: '', lastName: '', identityDocument: '',
  birthDate: '', email: '', phonePrefix: '+34', mobile: '', employmentStatus: '',
  monthlyIncome: null, monthlyExpenses: null, iban: '', privacyTermsAccepted: false,
  creditCheckAccepted: false, marketingAccepted: false,
};
const STORAGE_KEY = 'prestia-loan-visit';

interface SavedVisit { draft: LoanDraft; step: number; applicationId: string | null; idempotencyKey: string | null; }

function restore(): SavedVisit {
  const fallback: SavedVisit = { draft: INITIAL_DRAFT, step: 0, applicationId: null, idempotencyKey: null };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== 'object' || saved === null || !('draft' in saved) || !('step' in saved)) return fallback;
    const visit = saved as Partial<SavedVisit>;
    const draft = visit.draft;
    if (!draft || !Number.isInteger(draft.amount) || draft.amount < 50 || draft.amount > 2000 || draft.amount % 50 !== 0 ||
        !Number.isInteger(draft.termDays) || draft.termDays < 7 || draft.termDays > 90) return fallback;
    return {
      draft: { ...INITIAL_DRAFT, ...draft },
      step: typeof visit.step === 'number' && visit.step >= 0 && visit.step <= 4 ? visit.step : 0,
      applicationId: typeof visit.applicationId === 'string' ? visit.applicationId : null,
      idempotencyKey: typeof visit.idempotencyKey === 'string' ? visit.idempotencyKey : null,
    };
  } catch { return fallback; }
}

@Injectable({ providedIn: 'root' })
export class LoanVisitService {
  private readonly initial = restore();
  readonly draft = signal<LoanDraft>(this.initial.draft);
  readonly step = signal(this.initial.step);
  readonly applicationId = signal<string | null>(this.initial.applicationId);
  private readonly key = signal<string | null>(this.initial.idempotencyKey);
  readonly amount = computed(() => this.draft().amount);
  readonly termDays = computed(() => this.draft().termDays);

  private persist(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        draft: this.draft(), step: this.step(), applicationId: this.applicationId(), idempotencyKey: this.key(),
      } satisfies SavedVisit));
    } catch { /* La navegación sigue funcionando si el almacenamiento está deshabilitado. */ }
  }

  update(changes: Partial<LoanDraft>): void {
    const previous = this.draft();
    const changed = (Object.keys(changes) as (keyof LoanDraft)[]).some((field) => previous[field] !== changes[field]);
    if (!changed) return;
    this.draft.set({ ...previous, ...changes });
    this.key.set(null);
    this.persist();
  }

  goTo(step: number): void {
    this.step.set(step);
    this.persist();
  }

  submissionKey(): string {
    const key = this.key() ?? crypto.randomUUID();
    this.key.set(key);
    this.persist();
    return key;
  }

  saved(id: string): void {
    this.applicationId.set(id);
    this.goTo(4);
  }

  modify(): void {
    this.applicationId.set(null);
    this.key.set(null);
    this.goTo(0);
  }
}
