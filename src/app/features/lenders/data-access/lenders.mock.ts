import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { Page, toPage } from '../../../shared/models/page';
import { Lender, LenderFilters } from '../models/lenders.models';

const lenders: Lender[] = [
  { id: 'luma', name: 'Luma Crédito', initials: 'LC', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 60, minAge: 18, maxAge: 75, firstLoanFree: true, acceptsAsnef: true, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'nexo', name: 'Nexo Financiero', initials: 'NF', minAmount: 50, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 21, maxAge: 70, firstLoanFree: false, acceptsAsnef: false, noPayslip: true, responseMinutes: 30, recommended: true },
  { id: 'brio', name: 'Brío Préstamos', initials: 'BP', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 60, minAge: 18, maxAge: 80, firstLoanFree: false, acceptsAsnef: true, noPayslip: false, responseMinutes: 90, recommended: false },
  { id: 'via', name: 'Vía Capital', initials: 'VC', minAmount: 200, maxAmount: 2000, minTermDays: 15, maxTermDays: 90, minAge: 25, maxAge: 65, firstLoanFree: true, acceptsAsnef: false, noPayslip: false, responseMinutes: 120, recommended: false },
];

function priced(lender: Lender, amount: number | null, termDays: number | null): Lender {
  if (amount === null || termDays === null) return { ...lender };
  const returning = amount + Math.round(amount * 0.01 * termDays);
  const newTotal = lender.firstLoanFree
    ? amount + Math.round(amount * 0.01 * Math.max(0, termDays - 30))
    : returning;
  return { ...lender, totalNew: newTotal, totalReturning: returning };
}

export function listLendersMock(filters: LenderFilters, featured = false): Observable<Page<Lender>> {
  const matched = lenders.filter((lender) => featured || (
    (filters.amount === null || (lender.minAmount <= filters.amount && lender.maxAmount >= filters.amount)) &&
    (filters.termDays === null || (lender.minTermDays <= filters.termDays && lender.maxTermDays >= filters.termDays)) &&
    (filters.age === null || (lender.minAge <= filters.age && lender.maxAge >= filters.age)) &&
    (!filters.firstLoanFree || lender.firstLoanFree) &&
    (!filters.acceptsAsnef || lender.acceptsAsnef) &&
    (!filters.noPayslip || lender.noPayslip)
  )).map((lender) => priced(lender, featured ? null : filters.amount, featured ? null : filters.termDays));
  matched.sort((a, b) => {
    if (featured) return Number(b.recommended) - Number(a.recommended) || a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
    switch (filters.order) {
      case 'total': return (a.totalNew ?? 0) - (b.totalNew ?? 0) || a.name.localeCompare(b.name);
      case 'maxAmount': return b.maxAmount - a.maxAmount || a.name.localeCompare(b.name);
      case 'response': return a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
      default: return Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name);
    }
  });
  return mockResponse(toPage(featured ? matched.slice(0, 3) : matched, 0, 50));
}
