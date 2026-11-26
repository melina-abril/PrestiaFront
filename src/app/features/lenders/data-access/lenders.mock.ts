import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { Page, toPage } from '../../../shared/models/page';
import { LenderFilters, LenderResponse } from '../models/lenders.models';

const lenders: LenderResponse[] = [
  { id: 'prestamix', name: 'Prestamix', acronym: 'PX', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 30, minAge: 21, maxAge: 70, firstLoanFree: true, acceptsAsnef: true, noPayslip: true, responseMinutes: 15, recommended: true, totalNew: null, totalRecurring: null },
  { id: 'rapicredit', name: 'Rapicrédit', acronym: 'RC', minAmount: 50, maxAmount: 1500, minTermDays: 7, maxTermDays: 35, minAge: 18, maxAge: 75, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 10, recommended: false, totalNew: null, totalRecurring: null },
  { id: 'monedia', name: 'Monedia', acronym: 'MO', minAmount: 50, maxAmount: 1200, minTermDays: 7, maxTermDays: 30, minAge: 21, maxAge: 70, firstLoanFree: true, acceptsAsnef: true, noPayslip: false, responseMinutes: 20, recommended: false, totalNew: null, totalRecurring: null },
  { id: 'kredo', name: 'Kredo', acronym: 'KR', minAmount: 100, maxAmount: 600, minTermDays: 7, maxTermDays: 30, minAge: 18, maxAge: 70, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 30, recommended: false, totalNew: null, totalRecurring: null },
];

export function listLendersMock(filters: LenderFilters): Observable<Page<LenderResponse>> {
  const featured = filters.featured === true;
  const matches = lenders.filter((lender) => featured || (
    (filters.amount === undefined || (filters.amount >= lender.minAmount && filters.amount <= lender.maxAmount)) &&
    (filters.termDays === undefined || (filters.termDays >= lender.minTermDays && filters.termDays <= lender.maxTermDays)) &&
    (filters.age === undefined || (filters.age >= lender.minAge && filters.age <= lender.maxAge)) &&
    (!filters.firstLoanFree || lender.firstLoanFree) &&
    (!filters.asnef || lender.acceptsAsnef) &&
    (!filters.noPayslip || lender.noPayslip)
  ));
  const result = matches.map((lender): LenderResponse => {
    if (featured || filters.amount === undefined || filters.termDays === undefined) return { ...lender };
    const recurringInterest = Math.round(filters.amount * filters.termDays * 0.01);
    const newInterest = lender.firstLoanFree ? Math.round(filters.amount * Math.max(0, filters.termDays - 30) * 0.01) : recurringInterest;
    return { ...lender, totalNew: filters.amount + newInterest, totalRecurring: filters.amount + recurringInterest };
  });
  const sort = featured ? 'response' : filters.sort ?? 'recommended';
  result.sort((a, b) => {
    if (featured && a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (sort === 'recommended' && a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (sort === 'total' && a.totalNew !== null && b.totalNew !== null) return a.totalNew - b.totalNew || a.name.localeCompare(b.name);
    if (sort === 'maxAmount') return b.maxAmount - a.maxAmount || a.name.localeCompare(b.name);
    if (sort === 'response') return a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
  return mockResponse(toPage(featured ? result.slice(0, 3) : result, 0, 100));
}
