export type LenderOrder = 'recommended' | 'total' | 'maxAmount' | 'response';

/** Campos públicos de LenderResponse; la URL de afiliación no forma parte de la respuesta. */
export interface Lender {
  id: string;
  name: string;
  initials: string;
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
  totalNew?: number;
  totalReturning?: number;
}

export interface LenderFilters {
  amount: number | null;
  termDays: number | null;
  age: number | null;
  firstLoanFree: boolean;
  acceptsAsnef: boolean;
  noPayslip: boolean;
  order: LenderOrder;
}

export const EMPTY_FILTERS: LenderFilters = {
  amount: null,
  termDays: null,
  age: null,
  firstLoanFree: false,
  acceptsAsnef: false,
  noPayslip: false,
  order: 'recommended',
};

export function responseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1).replace('.', ',')} h`;
}
