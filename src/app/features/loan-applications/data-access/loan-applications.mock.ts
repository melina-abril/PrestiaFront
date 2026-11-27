import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ApplicationCreatedResponse, ApplicationOfferResponse, ApplicationOffersResponse, ApplicationRequest, OfferClickResponse } from '../models/loan-applications.models';

const applications = new Map<string, ApplicationRequest>();
const idempotencyKeys = new Map<string, string>();

export function createApplicationMock(request: ApplicationRequest, key: string): Observable<ApplicationCreatedResponse> {
  const existing = idempotencyKeys.get(key);
  if (existing) return mockResponse({ id: existing });
  if (!request.privacyAccepted) return mockError(400, 'Debes aceptar la Política de privacidad y los Términos.', { privacyAccepted: ['Debes aceptar la Política de privacidad y los Términos.'] });
  const id = globalThis.crypto.randomUUID();
  applications.set(id, request);
  idempotencyKeys.set(key, id);
  return mockResponse({ id });
}

export function getApplicationOffersMock(id: string): Observable<ApplicationOffersResponse> {
  const application = applications.get(id);
  if (!application) return mockError(404, 'No se encontró la solicitud.');
  if (application.amount > 1800 && application.asnefStatus === 'SI') return mockResponse({ status: 'SIN_OFERTAS', offers: [] });
  const interest = Math.round(application.amount * 0.01 * Math.max(0, application.termDays - 30));
  const recurring = Math.round(application.amount * 0.01 * application.termDays);
  const offers: ApplicationOfferResponse[] = [
    { lenderId: 'entidad-uno', name: 'Financia Uno', initials: 'FU', amount: application.amount, termDays: application.termDays, totalNew: application.amount + interest, totalReturning: application.amount + recurring, firstLoanFree: true, responseMinutes: 15, bestOffer: true },
    { lenderId: 'entidad-dos', name: 'Crédito Claro', initials: 'CC', amount: application.amount, termDays: application.termDays, totalNew: application.amount + interest + 12, totalReturning: application.amount + recurring + 12, firstLoanFree: false, responseMinutes: 30, bestOffer: false },
    { lenderId: 'entidad-tres', name: 'Préstamo Ágil', initials: 'PÁ', amount: application.amount, termDays: application.termDays, totalNew: application.amount + interest + 25, totalReturning: application.amount + recurring + 25, firstLoanFree: false, responseMinutes: 90, bestOffer: false },
  ];
  return mockResponse({ status: 'OFERTADA', offers });
}

export function recordOfferClickMock(id: string, lenderId: string): Observable<OfferClickResponse> {
  if (!applications.has(id)) return mockError(404, 'No se encontró la solicitud.');
  if (!['entidad-uno', 'entidad-dos', 'entidad-tres'].includes(lenderId)) return mockError(404, 'La entidad no figura entre tus ofertas.');
  const params = new URLSearchParams({ utm_source: 'credara', utm_medium: 'comparador', ref: id });
  return mockResponse({ url: `https://example.com/oferta?${params.toString()}` });
}
