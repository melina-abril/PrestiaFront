export interface LoanQuote {
  interest: number;
  total: number;
  tae: number;
}

export interface LoanCalculation {
  amount: number;
  days: number;
  newCustomer: LoanQuote;
  returningCustomer: LoanQuote;
  repaymentDate: string;
}

function quote(amount: number, days: number, chargeableDays: number): LoanQuote {
  const interest = Math.round(amount * chargeableDays * 0.01 * 100) / 100;
  const total = Math.round((amount + interest) * 100) / 100;
  const tae = Math.round((Math.pow(total / amount, 365 / days) - 1) * 10000) / 100;
  return { interest, total, tae };
}

export function calculateLoan(amount: number, days: number): LoanCalculation {
  if (!Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0) {
    throw new RangeError('El importe debe estar entre 50 € y 2.000 €, en pasos de 50 €.');
  }
  if (!Number.isInteger(days) || days < 7 || days > 90) {
    throw new RangeError('El plazo debe estar entre 7 y 90 días.');
  }

  const today = new Date();
  const repayment = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + days));
  return {
    amount,
    days,
    newCustomer: quote(amount, days, Math.max(0, days - 30)),
    returningCustomer: quote(amount, days, days),
    repaymentDate: repayment.toISOString().slice(0, 10),
  };
}
