import { Injectable, signal } from '@angular/core';

export interface LoanDraft {
  amount: number;
  termDays: number;
  step: number;
  purpose: string;
  firstName: string;
  lastName: string;
  identityDocument: string;
  birthDate: string;
  email: string;
  phonePrefix: string;
  mobile: string;
  employmentStatus: string;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  iban: string;
  privacyTermsAccepted: boolean;
  creditCheckAccepted: boolean;
  marketingAccepted: boolean;
  applicationId: string | null;
  idempotencyKey: string | null;
}

const INITIAL_DRAFT: LoanDraft = {
  amount: 500, termDays: 30, step: 0, purpose: '', firstName: '', lastName: '',
  identityDocument: '', birthDate: '', email: '', phonePrefix: '+34', mobile: '',
  employmentStatus: '', monthlyIncome: null, monthlyExpenses: null, iban: '',
  privacyTermsAccepted: false, creditCheckAccepted: false, marketingAccepted: false,
  applicationId: null, idempotencyKey: null,
};

const STORAGE_KEY = 'prestia-loan-draft';

@Injectable({ providedIn: 'root' })
export class LoanDraftService {
  private readonly current = signal<LoanDraft>(this.restore());
  readonly draft = this.current.asReadonly();

  update(change: Partial<LoanDraft>): void {
    const next = { ...this.current(), ...change };
    this.current.set(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private restore(): LoanDraft {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return { ...INITIAL_DRAFT };
      const parsed: unknown = JSON.parse(saved);
      if (typeof parsed !== 'object' || parsed === null || !('amount' in parsed) || !('termDays' in parsed) ||
          typeof parsed.amount !== 'number' || typeof parsed.termDays !== 'number' ||
          parsed.amount < 50 || parsed.amount > 2000 || parsed.amount % 50 !== 0 ||
          parsed.termDays < 7 || parsed.termDays > 90 || !Number.isInteger(parsed.termDays)) return { ...INITIAL_DRAFT };
      return { ...INITIAL_DRAFT, ...parsed } as LoanDraft;
    } catch {
      return { ...INITIAL_DRAFT };
    }
  }
}
