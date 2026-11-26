export type EmploymentStatus = 'CUENTA_AJENA' | 'AUTONOMO' | 'PENSIONISTA' | 'DESEMPLEADO_PRESTACION' | 'OTROS_INGRESOS';
export type AsnefAnswer = 'NO' | 'SI' | 'NO_SE';
export type LoanRequestStatus = 'RECIBIDA' | 'OFERTADA' | 'SIN_OFERTAS';

export interface LoanRequestInput {
  amount: number;
  termDays: number;
  name: string;
  birthDate: string;
  mobile: string;
  email: string;
  employmentStatus: EmploymentStatus;
  asnef: AsnefAnswer;
  acceptsPrivacy: true;
  acceptsCommunications: boolean;
}

export interface LoanRequestCreatedResponse {
  id: string;
  status: LoanRequestStatus;
}

export interface LoanOfferResponse {
  lenderId: string;
  name: string;
  acronym: string;
  amount: number;
  termDays: number;
  totalNew: number;
  totalReturning: number;
  firstLoanFree: boolean;
  responseMinutes: number;
  bestOffer: boolean;
}

export interface OfferClickInput {
  lenderId: string;
}

export interface OfferClickResponse {
  url: string;
}

export const EMPLOYMENT_OPTIONS: readonly { value: EmploymentStatus; label: string }[] = [
  { value: 'CUENTA_AJENA', label: 'Por cuenta ajena' },
  { value: 'AUTONOMO', label: 'Autónomo' },
  { value: 'PENSIONISTA', label: 'Pensionista' },
  { value: 'DESEMPLEADO_PRESTACION', label: 'Desempleado con prestación' },
  { value: 'OTROS_INGRESOS', label: 'Otros ingresos' },
];

export const ASNEF_OPTIONS: readonly { value: AsnefAnswer; label: string }[] = [
  { value: 'NO', label: 'No' },
  { value: 'SI', label: 'Sí' },
  { value: 'NO_SE', label: 'No lo sé' },
];
