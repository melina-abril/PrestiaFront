export type LenderOrder = 'recommended' | 'total' | 'maxAmount' | 'response';

/** Respuesta pública de GET /api/lenders. La URL de afiliación no se expone. */
export interface LenderResponse {
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
  amount?: number;
  termDays?: number;
  age?: number;
  firstLoanFree?: boolean;
  acceptsAsnef?: boolean;
  noPayslip?: boolean;
  order: LenderOrder;
  featured?: boolean;
  page: number;
  size: number;
}

export function responseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Number((minutes / 60).toFixed(1)).toString().replace('.', ',')} h`;
}
