import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { Page, toPage } from '../../../shared/models/page';
import { Lender, LenderFilters } from '../models/lenders.models';

const lenders: Lender[] = [
  { id: 'luma', name: 'Luma Crédito', acronym: 'LC', minAmount: 50, maxAmount: 1000, minTermDays: 7, maxTermDays: 30, minAge: 18, maxAge: 70, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 15, recommended: true, totalNew: null, totalRecurring: null },
  { id: 'nexo', name: 'Nexo Préstamos', acronym: 'NP', minAmount: 100, maxAmount: 2000, minTermDays: 15, maxTermDays: 90, minAge: 21, maxAge: 75, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 10, recommended: true, totalNew: null, totalRecurring: null },
  { id: 'brisa', name: 'Brisa Financiera', acronym: 'BF', minAmount: 200, maxAmount: 1500, minTermDays: 30, maxTermDays: 60, minAge: 23, maxAge: 80, firstLoanFree: true, acceptsAsnef: true, noPayslip: false, responseMinutes: 90, recommended: false, totalNew: null, totalRecurring: null },
  { id: 'claro', name: 'Claro Préstamo', acronym: 'CP', minAmount: 50, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 18, maxAge: 75, firstLoanFree: false, acceptsAsnef: false, noPayslip: true, responseMinutes: 30, recommended: false, totalNew: null, totalRecurring: null },
];

export function listLendersMock(filters: LenderFilters): Observable<Page<Lender>> {
  const matched = lenders.filter((lender) => filters.featured || (
    (filters.amount === undefined || (filters.amount >= lender.minAmount && filters.amount <= lender.maxAmount)) &&
    (filters.termDays === undefined || (filters.termDays >= lender.minTermDays && filters.termDays <= lender.maxTermDays)) &&
    (filters.age === undefined || (filters.age >= lender.minAge && filters.age <= lender.maxAge)) &&
    (!filters.firstLoanFree || lender.firstLoanFree) && (!filters.asnef || lender.acceptsAsnef) &&
    (!filters.noPayslip || lender.noPayslip)
  )).map((lender): Lender => {
    if (filters.featured || filters.amount === undefined || filters.termDays === undefined) return { ...lender };
    const recurringInterest = Math.round(filters.amount * 0.01 * filters.termDays);
    const newInterest = lender.firstLoanFree ? Math.round(filters.amount * 0.01 * Math.max(0, filters.termDays - 30)) : recurringInterest;
    return { ...lender, totalNew: filters.amount + newInterest, totalRecurring: filters.amount + recurringInterest };
  });
  matched.sort((a, b) => {
    if (filters.featured) return Number(b.recommended) - Number(a.recommended) || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
    switch (filters.sort) {
      case 'total': return (a.totalNew ?? 0) - (b.totalNew ?? 0) || a.name.localeCompare(b.name);
      case 'maxAmount': return b.maxAmount - a.maxAmount || a.name.localeCompare(b.name);
      case 'response': return a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
      default: return Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name);
    }
  });
  return mockResponse(toPage(filters.featured ? matched.slice(0, 3) : matched, filters.page, filters.size));
}
