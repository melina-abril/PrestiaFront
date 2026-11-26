export type LenderSort = 'recommended' | 'total' | 'maxAmount' | 'response';

/** Campos públicos de LenderResponse. La URL de afiliación no forma parte de la respuesta. */
export interface LenderResponse {
  id: string;
  name: string;
  acronym: string;
  minAmount: number;
  maxAmount: number;
  minTermDays: number;
  maxTermDays: number;
  minAge: number;
  maxAge: number;
  firstLoanFree: boolean;
  acceptsAsnef: boolean;
  noPayslip: boolean;
  responseMinutes: number;
  recommended: boolean;
  totalNew: number | null;
  totalRecurring: number | null;
}

export interface LenderFilters {
  amount?: number;
  termDays?: number;
  age?: number;
  firstLoanFree?: boolean;
  asnef?: boolean;
  noPayslip?: boolean;
  sort?: LenderSort;
  featured?: boolean;
}
