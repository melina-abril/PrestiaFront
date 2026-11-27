import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../../loan-simulator/shared/loan-calculation';

interface CostRow {
  readonly days: number;
  readonly newCost: number;
  readonly newTotal: number;
  readonly newApr: number;
  readonly returningCost: number;
  readonly returningTotal: number;
  readonly returningApr: number;
}

interface OfferResult {
  readonly amount: number;
  readonly cost: number;
  readonly days: number;
  readonly total: number;
  readonly apr: number;
}

const TERMS: readonly number[] = [7, 15, 30, 45, 60, 90];

const COST_ROWS: readonly CostRow[] = TERMS.map((days) => {
  const loan = calculateLoan(100, days);
  return {
    days,
    newCost: loan.newCustomer.interest,
    newTotal: loan.newCustomer.total,
    newApr: Math.round(loan.newCustomer.tae),
    returningCost: loan.returningCustomer.interest,
    returningTotal: loan.returningCustomer.total,
    returningApr: Math.round(loan.returningCustomer.tae),
  };
});

@Component({
  selector: 'app-apr-calculator-page',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './apr-calculator-page.html',
  styleUrl: './apr-calculator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AprCalculatorPage {
  protected readonly amount = signal('300');
  protected readonly cost = signal('90');
  protected readonly days = signal('30');
  protected readonly rows = COST_ROWS;

  protected readonly amountError = computed(() => this.validate(this.amount(), 1, 100000, 'El importe debe estar entre 1 y 100.000 €.'));
  protected readonly costError = computed(() => this.validate(this.cost(), 0, 100000, 'Los intereses y comisiones deben estar entre 0 y 100.000 €.'));
  protected readonly daysError = computed(() => {
    const error = this.validate(this.days(), 1, 365, 'El plazo debe estar entre 1 y 365 días.');
    return error || (!Number.isInteger(Number(this.days())) ? 'El plazo debe ser un número entero de días.' : '');
  });

  protected readonly result = computed<OfferResult | null>(() => {
    if (this.amountError() || this.costError() || this.daysError()) return null;
    const amount = Number(this.amount());
    const cost = Number(this.cost());
    const days = Number(this.days());
    return {
      amount,
      cost,
      days,
      total: amount + cost,
      apr: Math.round((Math.pow(1 + cost / amount, 365 / days) - 1) * 100),
    };
  });

  protected updateAmount(value: string): void {
    this.amount.set(value);
  }

  protected updateCost(value: string): void {
    this.cost.set(value);
  }

  protected updateDays(value: string): void {
    this.days.set(value);
  }

  protected scrollToResult(): void {
    document.getElementById('apr-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected NumberIsFiniteApr(value: number): boolean {
    return Number.isFinite(value);
  }

  private validate(value: string, min: number, max: number, rangeMessage: string): string {
    if (value.trim() === '') return 'Este campo es obligatorio.';
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max ? '' : rangeMessage;
  }
}
