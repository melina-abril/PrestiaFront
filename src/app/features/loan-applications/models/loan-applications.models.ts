export type LoanPurpose = 'UNEXPECTED_EXPENSE' | 'TRAVEL' | 'PURCHASES' | 'HOME' | 'HEALTH' | 'EDUCATION' | 'OTHER';
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'RETIRED' | 'STUDENT' | 'OTHER';
export type ApplicationStatus = 'RECIBIDA' | 'OFERTADA' | 'SIN_OFERTAS';

/** Campos del POST /api/loan-applications. */
export interface LoanApplicationRequest {
  amount: number;
  termDays: number;
  purpose: LoanPurpose;
  firstName: string;
  lastName: string;
  identityDocument: string;
  birthDate: string;
  email: string;
  phonePrefix: string;
  mobile: string;
  employmentStatus: EmploymentStatus;
  monthlyIncome: number;
  monthlyExpenses: number | null;
  iban: string;
  privacyTermsAccepted: true;
  creditCheckAccepted: true;
  marketingAccepted: boolean;
}

export interface LoanApplicationCreatedResponse {
  id: string;
}

export interface LoanOfferResponse {
  lenderId: string;
  lender: string;
  initials: string;
  amount: number;
  termDays: number;
  totalRepayment: number;
  firstLoanFree: boolean;
  responseTime: string;
  websiteUrl: string;
}

export interface LoanApplicationOffersResponse {
  applicationId: string;
  status: ApplicationStatus;
  offers: LoanOfferResponse[];
}

export interface LoanCalculation {
  interest: number;
  total: number;
  tae: number;
}

export function calculateLoan(amount: number, termDays: number, firstLoan: boolean): LoanCalculation {
  const interest = Math.round(amount * 0.01 * (firstLoan ? Math.max(0, termDays - 30) : termDays));
  return {
    interest,
    total: amount + interest,
    tae: interest === 0 ? 0 : Math.round((Math.pow(1 + interest / amount, 365 / termDays) - 1) * 100),
  };
}

export function repaymentDate(termDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + termDays);
  return date;
}

export const PURPOSE_OPTIONS: readonly { value: LoanPurpose; label: string }[] = [
  { value: 'UNEXPECTED_EXPENSE', label: 'Imprevisto o urgencia' },
  { value: 'PURCHASES', label: 'Compras o electrodomésticos' },
  { value: 'TRAVEL', label: 'Viaje o vacaciones' },
  { value: 'OTHER', label: 'Otro motivo' },
];

export const EMPLOYMENT_OPTIONS: readonly { value: EmploymentStatus; label: string }[] = [
  { value: 'EMPLOYED', label: 'Empleado/a' },
  { value: 'SELF_EMPLOYED', label: 'Autónomo/a' },
  { value: 'RETIRED', label: 'Jubilado/a o pensionista' },
  { value: 'UNEMPLOYED', label: 'Desempleado/a' },
];
