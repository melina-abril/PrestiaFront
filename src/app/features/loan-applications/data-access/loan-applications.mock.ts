import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanApplicationCreatedResponse, LoanApplicationOffersResponse, LoanApplicationRequest } from '../models/loan-applications.models';

const applications = new Map<string, LoanApplicationRequest>();
const keys = new Map<string, string>();

export function createLoanApplicationMock(request: LoanApplicationRequest, key: string): Observable<LoanApplicationCreatedResponse> {
  const existing = keys.get(key);
  if (existing) return mockResponse({ id: existing });
  if (!request.privacyTermsAccepted || !request.creditCheckAccepted) {
    return mockError(422, 'Acepta las condiciones obligatorias.');
  }
  const id = crypto.randomUUID();
  applications.set(id, request);
  keys.set(key, id);
  return mockResponse({ id });
}

export function getLoanApplicationOffersMock(id: string): Observable<LoanApplicationOffersResponse> {
  const request = applications.get(id);
  if (!request) return mockError(404, 'No se encontró la solicitud.');
  const { amount, termDays } = request;
  return mockResponse({
    applicationId: id,
    status: 'OFERTADA',
    offers: [
      { lenderId: 'credi-facil', lender: 'CrediFácil', initials: 'CF', amount, termDays, totalRepayment: amount + Math.round(amount * 0.01 * Math.max(0, termDays - 30)), firstLoanFree: true, responseTime: '10 min', websiteUrl: 'https://example.com/credi-facil' },
      { lenderId: 'money-rapido', lender: 'MoneyRápido', initials: 'MR', amount, termDays, totalRepayment: amount + Math.round(amount * 0.004 * termDays), firstLoanFree: false, responseTime: '15 min', websiteUrl: 'https://example.com/money-rapido' },
    ],
  });
}
