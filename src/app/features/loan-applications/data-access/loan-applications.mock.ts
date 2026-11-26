import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { calculateLoan } from '../models/loan-calculation';
import { LoanApplicationCreatedResponse, LoanApplicationOffersResponse, LoanApplicationRequest, LoanOfferResponse } from '../models/loan-applications.models';

const applications = new Map<string, LoanApplicationRequest>();
const keys = new Map<string, string>();

export function createLoanApplicationMock(request: LoanApplicationRequest, key: string): Observable<LoanApplicationCreatedResponse> {
  const existing = keys.get(key);
  if (existing) return mockResponse({ id: existing });
  if (request.amount < 50 || request.amount > 2000 || request.amount % 50 !== 0 || request.termDays < 7 || request.termDays > 90) {
    return mockError(400, 'Revisa el monto y el plazo.', { amount: ['Selecciona un monto válido.'] });
  }
  const id = crypto.randomUUID();
  applications.set(id, request);
  keys.set(key, id);
  return mockResponse({ id });
}

export function getLoanApplicationOffersMock(id: string): Observable<LoanApplicationOffersResponse> {
  const request = applications.get(id);
  if (!request) return mockError(404, 'No encontramos la solicitud.');
  const { amount, termDays } = request;
  const quote = calculateLoan(amount, termDays);
  const offers: LoanOfferResponse[] = [
    { lenderId: 'credifacil', lender: 'CrediFácil', initials: 'CF', amount, termDays, totalRepayment: quote.newCustomer.total, firstLoanFree: true, responseTime: '10 min', websiteUrl: 'https://example.com/credifacil' },
    { lenderId: 'moneyrapido', lender: 'MoneyRápido', initials: 'MR', amount, termDays, totalRepayment: quote.newCustomer.total + 60, firstLoanFree: false, responseTime: '15 min', websiteUrl: 'https://example.com/moneyrapido' },
    { lenderId: 'prestaexpress', lender: 'PrestaExpress', initials: 'PX', amount, termDays, totalRepayment: quote.newCustomer.total + 90, firstLoanFree: false, responseTime: '1 h', websiteUrl: 'https://example.com/prestaexpress' },
  ];
  return mockResponse({ applicationId: id, status: 'OFERTADA', offers });
}
