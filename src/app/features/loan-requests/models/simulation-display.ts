import { calculateLoan } from './loan-calculation';

export interface DisplayQuote {
  interest: number;
  total: number;
  tae: number;
  capitalPercent: number;
}

export interface DisplaySimulation {
  amount: number;
  days: number;
  newCustomer: DisplayQuote;
  returningCustomer: DisplayQuote;
  repaymentDate: string;
  savings: number;
}

/** La presentación aplica redondeo comercial al euro antes de calcular la TAE. */
export function displaySimulation(amount: number, days: number): DisplaySimulation {
  const base = calculateLoan(amount, days);
  const quote = (chargedDays: number): DisplayQuote => {
    const interest = Math.floor(amount * 0.01 * chargedDays + 0.5 + Number.EPSILON);
    const total = amount + interest;
    return {
      interest,
      total,
      tae: Math.round((Math.pow(total / amount, 365 / days) - 1) * 100),
      capitalPercent: Math.round(amount / total * 100),
    };
  };
  const newCustomer = quote(Math.max(0, days - 30));
  const returningCustomer = quote(days);
  return {
    amount,
    days,
    newCustomer,
    returningCustomer,
    repaymentDate: base.repaymentDate,
    savings: returningCustomer.interest - newCustomer.interest,
  };
}
