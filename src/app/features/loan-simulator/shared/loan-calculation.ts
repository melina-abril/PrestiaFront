export interface LoanCost {
  readonly interest: number;
  readonly total: number;
  readonly tae: number;
}

export interface LoanCalculation {
  readonly amount: number;
  readonly termDays: number;
  readonly dueDate: string;
  readonly newCustomer: LoanCost;
  readonly returningCustomer: LoanCost;
}

/** Calcula el coste con interés simple del 1 % diario y TAE anual efectiva. */
export function calculateLoan(amount: number, termDays: number): LoanCalculation {
  if (!Number.isFinite(amount) || amount < 50 || amount > 2000) {
    throw new RangeError('El importe debe estar entre 50 € y 2.000 €.');
  }
  if (!Number.isInteger(termDays) || termDays < 7 || termDays > 90) {
    throw new RangeError('El plazo debe estar entre 7 y 90 días.');
  }

  const costFor = (chargeableDays: number): LoanCost => {
    const interest = Math.round(amount * 0.01 * chargeableDays);
    const total = amount + interest;
    const tae = (Math.pow(total / amount, 365 / termDays) - 1) * 100;
    return { interest, total, tae };
  };

  const dueDate = new Date();
  dueDate.setHours(12, 0, 0, 0);
  dueDate.setDate(dueDate.getDate() + termDays);
  const year = dueDate.getFullYear();
  const month = String(dueDate.getMonth() + 1).padStart(2, '0');
  const day = String(dueDate.getDate()).padStart(2, '0');

  return {
    amount,
    termDays,
    dueDate: `${year}-${month}-${day}`,
    newCustomer: costFor(Math.max(0, termDays - 30)),
    returningCustomer: costFor(termDays),
  };
}
