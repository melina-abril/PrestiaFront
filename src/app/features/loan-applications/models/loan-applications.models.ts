export type EmploymentStatus = 'CUENTA_AJENA' | 'AUTONOMO' | 'PENSIONISTA' | 'DESEMPLEADO_PRESTACION' | 'OTROS_INGRESOS';
export type AsnefStatus = 'NO' | 'SI' | 'NO_SE';

export interface ApplicationRequest {
  amount: number;
  termDays: number;
  name: string;
  birthDate: string;
  mobile: string;
  email: string;
  employmentStatus: EmploymentStatus;
  asnefStatus: AsnefStatus;
  privacyAccepted: true;
  marketingAccepted: boolean;
}

export interface ApplicationCreatedResponse {
  id: string;
}

export interface ApplicationOfferResponse {
  lenderId: string;
  name: string;
  initials: string;
  amount: number;
  termDays: number;
  totalNew: number;
  totalReturning: number;
  firstLoanFree: boolean;
  responseMinutes: number;
  bestOffer: boolean;
}

export interface ApplicationOffersResponse {
  status: 'OFERTADA' | 'SIN_OFERTAS';
  offers: ApplicationOfferResponse[];
}

export interface ClickRequest {
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
