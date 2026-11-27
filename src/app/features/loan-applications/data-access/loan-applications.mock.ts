import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ApplicationCreatedResponse, ApplicationOffersResponse, ApplicationRequest, OfferClickResponse } from '../models/loan-applications.models';

const applications = new Map<string, ApplicationRequest>();
const keys = new Map<string, string>();

export function createApplicationMock(request: ApplicationRequest, idempotencyKey: string): Observable<ApplicationCreatedResponse> {
  const existing = keys.get(idempotencyKey);
  if (existing) return mockResponse({ id: existing });
  const id = `sol-${applications.size + 1}`;
  applications.set(id, request);
  keys.set(idempotencyKey, id);
  return mockResponse({ id });
}

export function getApplicationOffersMock(id: string): Observable<ApplicationOffersResponse> {
  const request = applications.get(id);
  if (!request) return mockError(404, 'No se encontró la solicitud.');
  const matches = request.amount <= 1000 && request.termDays <= 60 && request.asnefStatus !== 'SI';
  if (!matches) return mockResponse({ status: 'SIN_OFERTAS', offers: [] });
  const interest = Math.round(request.amount * 0.01 * request.termDays);
  const freeInterest = Math.round(request.amount * 0.01 * Math.max(0, request.termDays - 30));
  return mockResponse({
    status: 'OFERTADA',
    offers: [
      {
        lenderId: 'entidad-aurora', name: 'Aurora Crédito', initials: 'AC',
        amount: request.amount, termDays: request.termDays,
        totalNew: request.amount + freeInterest, totalReturning: request.amount + interest,
        firstLoanFree: true, responseMinutes: 15, bestOffer: true,
      },
      {
        lenderId: 'entidad-nexo', name: 'Nexo Finanzas', initials: 'NF',
        amount: request.amount, termDays: request.termDays,
        totalNew: request.amount + interest, totalReturning: request.amount + interest,
        firstLoanFree: false, responseMinutes: 90, bestOffer: false,
      },
    ],
  });
}

export function recordOfferClickMock(id: string, lenderId: string): Observable<OfferClickResponse> {
  const request = applications.get(id);
  if (!request) return mockError(404, 'No se encontró la solicitud.');
  const allowed = lenderId === 'entidad-aurora' || lenderId === 'entidad-nexo';
  if (!allowed || request.amount > 1000 || request.termDays > 60 || request.asnefStatus === 'SI') {
    return mockError(404, 'Esta entidad no figura entre tus ofertas.');
  }
  return mockResponse({ url: `https://example.invalid/solicitud?utm_source=credara&utm_medium=comparador&ref=${encodeURIComponent(id)}` });
}
