export interface LoanCost {
  interest: number;
  total: number;
  tae: number;
}

export interface LoanCalculation {
  amount: number;
  termDays: number;
  repaymentDate: string;
  newCustomer: LoanCost;
  returningCustomer: LoanCost;
}

function costFor(amount: number, termDays: number, chargedDays: number): LoanCost {
  const interest = Math.round(amount * 0.01 * chargedDays);
  const total = amount + interest;
  const tae = interest === 0
    ? 0
    : Math.round((Math.pow(total / amount, 365 / termDays) - 1) * 10000) / 100;

  return { interest, total, tae };
}

export function calculateLoan(amount: number, termDays: number, today: Date = new Date()): LoanCalculation {
  if (!Number.isFinite(amount) || amount < 50 || amount > 2000) {
    throw new RangeError('El importe debe estar entre 50 € y 2.000 €.');
  }
  if (!Number.isInteger(termDays) || termDays < 7 || termDays > 90) {
    throw new RangeError('El plazo debe estar entre 7 y 90 días.');
  }
  if (Number.isNaN(today.getTime())) {
    throw new RangeError('La fecha de inicio no es válida.');
  }

  const repayment = new Date(today.getFullYear(), today.getMonth(), today.getDate() + termDays);
  const year = repayment.getFullYear();
  const month = String(repayment.getMonth() + 1).padStart(2, '0');
  const day = String(repayment.getDate()).padStart(2, '0');

  return {
    amount,
    termDays,
    repaymentDate: `${year}-${month}-${day}`,
    newCustomer: costFor(amount, termDays, Math.max(0, termDays - 30)),
    returningCustomer: costFor(amount, termDays, termDays)
  };
}
