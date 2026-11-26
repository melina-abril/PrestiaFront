export interface LoanCalculation {
  newInterest: number;
  returningInterest: number;
  newTotal: number;
  returningTotal: number;
  newApr: number;
  returningApr: number;
  repaymentDate: Date;
}

export function calculateLoan(amount: number, days: number): LoanCalculation {
  if (!Number.isFinite(amount) || amount < 50 || amount > 2000) {
    throw new RangeError('El importe debe estar entre 50 y 2.000 €.');
  }
  if (!Number.isInteger(days) || days < 7 || days > 90) {
    throw new RangeError('El plazo debe estar entre 7 y 90 días.');
  }

  const newInterest = Math.round(amount * 0.01 * Math.max(0, days - 30));
  const returningInterest = Math.round(amount * 0.01 * days);
  const newTotal = amount + newInterest;
  const returningTotal = amount + returningInterest;
  const repaymentDate = new Date();
  repaymentDate.setHours(12, 0, 0, 0);
  repaymentDate.setDate(repaymentDate.getDate() + days);

  return {
    newInterest,
    returningInterest,
    newTotal,
    returningTotal,
    newApr: (Math.pow(newTotal / amount, 365 / days) - 1) * 100,
    returningApr: (Math.pow(returningTotal / amount, 365 / days) - 1) * 100,
    repaymentDate
  };
}
