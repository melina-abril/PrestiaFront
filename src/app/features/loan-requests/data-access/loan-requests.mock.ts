import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanOfferResponse, LoanRequestCreatedResponse, LoanRequestInput, OfferClickResponse } from '../models/loan-requests.models';

const requests = new Map<string, LoanRequestInput>();
const keys = new Map<string, string>();
const availableOffers = new Map<string, LoanOfferResponse[]>();
let sequence = 0;

export function createLoanRequestMock(input: LoanRequestInput, key: string): Observable<LoanRequestCreatedResponse> {
  const existing = keys.get(key);
  if (existing) {
    const previous = requests.get(existing);
    if (JSON.stringify(previous) !== JSON.stringify(input)) {
      return mockError(409, 'Esta clave de idempotencia ya corresponde a otra solicitud.');
    }
    return mockResponse({ id: existing, status: availableOffers.has(existing) ? 'OFERTADA' : 'RECIBIDA' });
  }
  const id = `LR-demo-${++sequence}`;
  keys.set(key, id);
  requests.set(id, input);
  return mockResponse({ id, status: 'RECIBIDA' });
}

export function getLoanRequestOffersMock(id: string): Observable<LoanOfferResponse[]> {
  const request = requests.get(id);
  if (!request) return mockError(404, 'No existe la solicitud.');
  const offer = (lenderId: string, name: string, acronym: string, firstLoanFree: boolean, responseMinutes: number): LoanOfferResponse => {
    const interest = (days: number): number => Math.floor(request.amount * 0.01 * days + 0.5 + Number.EPSILON);
    return {
      lenderId, name, acronym, amount: request.amount, termDays: request.termDays,
      totalNew: request.amount + interest(firstLoanFree ? Math.max(0, request.termDays - 30) : request.termDays),
      totalReturning: request.amount + interest(request.termDays),
      firstLoanFree, responseMinutes, bestOffer: false,
    };
  };
  const offers = [
    offer('prestamix', 'Prestamix', 'PX', true, 15),
    offer('rapicredit', 'Rapicrédit', 'RC', true, 10),
    offer('kredo', 'Kredo', 'KR', false, 30),
  ].filter((item) => request.amount <= (item.lenderId === 'kredo' ? 2000 : 1000) && (request.asnef !== 'SI' || item.lenderId === 'kredo'))
    .sort((a, b) => a.totalNew - b.totalNew || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name, 'es'));
  if (offers.length) offers[0].bestOffer = true;
  availableOffers.set(id, offers);
  return mockResponse(offers);
}

export function recordOfferClickMock(id: string, lenderId: string): Observable<OfferClickResponse> {
  if (!availableOffers.get(id)?.some((offer) => offer.lenderId === lenderId)) {
    return mockError(404, 'No existe esa oferta para la solicitud.');
  }
  const url = new URL('https://example.invalid/solicitar');
  url.searchParams.set('utm_source', 'credara');
  url.searchParams.set('utm_medium', 'comparador');
  url.searchParams.set('ref', id);
  return mockResponse({ url: url.toString() });
}
