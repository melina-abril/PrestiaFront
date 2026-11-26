import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { AsnefAnswer, EmploymentStatus, LoanOfferResponse, LoanRequestCreatedResponse, LoanRequestInput, OfferClickResponse } from '../models/loan-requests.models';

const requests = new Map<string, LoanRequestInput>();
const keys = new Map<string, string>();
const calculatedOffers = new Map<string, LoanOfferResponse[]>();

const lenders: readonly {
  id: string; name: string; acronym: string; minAmount: number; maxAmount: number;
  minDays: number; maxDays: number; minAge: number; maxAge: number;
  firstLoanFree: boolean; acceptsAsnef: boolean; noPayslip: boolean; responseMinutes: number;
}[] = [
  { id: 'lender-1', name: 'Financia Online', acronym: 'FO', minAmount: 50, maxAmount: 2000, minDays: 7, maxDays: 90, minAge: 18, maxAge: 75, firstLoanFree: true, acceptsAsnef: true, noPayslip: true, responseMinutes: 15 },
  { id: 'lender-2', name: 'Crédito Claro', acronym: 'CC', minAmount: 100, maxAmount: 1500, minDays: 15, maxDays: 90, minAge: 21, maxAge: 70, firstLoanFree: true, acceptsAsnef: false, noPayslip: false, responseMinutes: 30 },
  { id: 'lender-3', name: 'Dinero Ágil', acronym: 'DA', minAmount: 200, maxAmount: 2000, minDays: 7, maxDays: 60, minAge: 25, maxAge: 80, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 90 },
];

function age(birthDate: string): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const today = new Date();
  return today.getUTCFullYear() - birth.getUTCFullYear() - (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate()) ? 1 : 0);
}

export function createLoanRequestMock(input: LoanRequestInput, key: string): Observable<LoanRequestCreatedResponse> {
  const existing = keys.get(key);
  if (existing) {
    if (JSON.stringify(requests.get(existing)) !== JSON.stringify(input)) return mockError(409, 'Esta clave de idempotencia ya corresponde a otra solicitud.');
    return mockResponse({ id: existing, status: calculatedOffers.has(existing) ? 'OFERTADA' : 'RECIBIDA' });
  }
  if (age(input.birthDate) < 18 || age(input.birthDate) > 100) return mockError(400, 'Revisa los datos.', { birthDate: ['Debes tener entre 18 y 100 años.'] });
  const id = `LR-mock-${Date.now()}-${requests.size + 1}`;
  requests.set(id, input);
  keys.set(key, id);
  return mockResponse({ id, status: 'RECIBIDA' });
}

export function getLoanRequestOffersMock(id: string): Observable<LoanOfferResponse[]> {
  const request = requests.get(id);
  if (!request) return mockError(404, 'No existe la solicitud.');
  const matching = lenders.filter((lender) => request.amount >= lender.minAmount && request.amount <= lender.maxAmount
    && request.termDays >= lender.minDays && request.termDays <= lender.maxDays
    && age(request.birthDate) >= lender.minAge && age(request.birthDate) <= lender.maxAge
    && (request.asnef !== 'SI' || lender.acceptsAsnef)
    && (!(['DESEMPLEADO_PRESTACION', 'OTROS_INGRESOS'] as readonly EmploymentStatus[]).includes(request.employmentStatus) || lender.noPayslip));
  const offers: LoanOfferResponse[] = matching.map((lender) => ({
    lenderId: lender.id, name: lender.name, acronym: lender.acronym,
    amount: request.amount, termDays: request.termDays,
    totalNew: request.amount + Math.floor(request.amount * 0.01 * (lender.firstLoanFree ? Math.max(0, request.termDays - 30) : request.termDays) + 0.5 + Number.EPSILON),
    totalReturning: request.amount + Math.floor(request.amount * 0.01 * request.termDays + 0.5 + Number.EPSILON),
    firstLoanFree: lender.firstLoanFree, responseMinutes: lender.responseMinutes, bestOffer: false,
  }));
  offers.sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name, 'es'));
  if (offers.length) offers[0].bestOffer = true;
  calculatedOffers.set(id, offers);
  return mockResponse(offers);
}

export function recordOfferClickMock(id: string, lenderId: string): Observable<OfferClickResponse> {
  if (!calculatedOffers.get(id)?.some((offer) => offer.lenderId === lenderId)) return mockError(404, 'No existe esa oferta para la solicitud.');
  return mockResponse({ url: `https://example.com/solicitud?utm_source=credara&utm_medium=comparador&ref=${encodeURIComponent(id)}` });
}
