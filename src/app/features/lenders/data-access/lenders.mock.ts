import { Observable } from 'rxjs';
import { mockResponse } from '../../../core/http/mock-response';
import { Page, toPage } from '../../../shared/models/page';
import { calculateLoan } from '../../loan-common/loan-calculation';
import { LenderFilters, LenderResponse } from '../models/lenders.models';

const lenders: LenderResponse[] = [
  { id: 'luma', name: 'Luma Crédito', initials: 'LC', minAmount: 100, maxAmount: 1000, minTermDays: 7, maxTermDays: 30, minAge: 18, maxAge: 70, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'nexo', name: 'Nexo Financiero', initials: 'NF', minAmount: 50, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 21, maxAge: 75, firstLoanFree: false, acceptsAsnef: true, noPayslip: false, responseMinutes: 30, recommended: true },
  { id: 'brio', name: 'Brío Préstamos', initials: 'BP', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 60, minAge: 18, maxAge: 65, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 90, recommended: false },
  { id: 'claro', name: 'Claro Finanzas', initials: 'CF', minAmount: 200, maxAmount: 2000, minTermDays: 15, maxTermDays: 90, minAge: 25, maxAge: 80, firstLoanFree: true, acceptsAsnef: false, noPayslip: false, responseMinutes: 60, recommended: false },
];

export function listLendersMock(filters: LenderFilters): Observable<Page<LenderResponse>> {
  const featured = filters.featured === true;
  const selected = lenders.filter((lender) => featured || (
    (filters.amount === undefined || (filters.amount >= lender.minAmount && filters.amount <= lender.maxAmount)) &&
    (filters.termDays === undefined || (filters.termDays >= lender.minTermDays && filters.termDays <= lender.maxTermDays)) &&
    (filters.age === undefined || (filters.age >= lender.minAge && filters.age <= lender.maxAge)) &&
    (!filters.firstLoanFree || lender.firstLoanFree) &&
    (!filters.acceptsAsnef || lender.acceptsAsnef) &&
    (!filters.noPayslip || lender.noPayslip)
  )).map((lender): LenderResponse => {
    if (featured || filters.amount === undefined || filters.termDays === undefined) return { ...lender };
    const calculation = calculateLoan(filters.amount, filters.termDays);
    return {
      ...lender,
      totalNew: lender.firstLoanFree ? calculation.newCustomer.total : calculation.returningCustomer.total,
      totalReturning: calculation.returningCustomer.total,
    };
  });
  selected.sort((a, b) => {
    if (featured || filters.order === 'recommended') return Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name);
    if (filters.order === 'total') return (a.totalNew ?? 0) - (b.totalNew ?? 0) || a.name.localeCompare(b.name);
    if (filters.order === 'maxAmount') return b.maxAmount - a.maxAmount || a.name.localeCompare(b.name);
    return a.responseMinutes - b.responseMinutes || a.name.localeCompare(b.name);
  });
  return mockResponse(toPage(selected, featured ? 0 : filters.page, featured ? 3 : filters.size));
}
