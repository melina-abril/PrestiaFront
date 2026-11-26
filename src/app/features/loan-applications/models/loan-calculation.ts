import { LoanCalculation, LoanQuote } from './loan-applications.models';

/** Los intereses se redondean antes de calcular la TAE. */
export function calculateLoan(amount: number, termDays: number, today: Date = new Date()): LoanCalculation {
  const quote = (chargedDays: number): LoanQuote => {
    const interest = Math.round(amount * 0.01 * chargedDays);
    const total = amount + interest;
    return {
      interest,
      annualRate: interest === 0 ? 0 : Math.round((Math.pow(1 + interest / amount, 365 / termDays) - 1) * 100),
      total,
      capitalPercent: (amount / total) * 100,
    };
  };
  const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + termDays);
  const newCustomer = quote(Math.max(0, termDays - 30));
  const returningCustomer = quote(termDays);
  return { newCustomer, returningCustomer, savings: returningCustomer.interest - newCustomer.interest, dueDate };
}
