import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../../loan-common/loan-calculation';

interface OfferCalculation {
  amount: number;
  cost: number;
  days: number;
  total: number;
  tae: number;
}

interface ReferenceRow {
  days: number;
  newCost: number;
  newTae: number;
  returningCost: number;
  returningTae: number;
}

const REFERENCE_TERMS: readonly number[] = [7, 15, 30, 45, 60, 90];

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

  protected readonly amountError = computed(() => this.validate(this.amount(), 1, 100000, 'El importe debe estar entre 1 y 100.000 €.'));
  protected readonly costError = computed(() => this.validate(this.cost(), 0, 100000, 'Los intereses y comisiones deben estar entre 0 y 100.000 €.'));
  protected readonly daysError = computed(() => {
    const value = this.days();
    return this.validate(value, 1, 365, 'El plazo debe estar entre 1 y 365 días.') ||
      (!Number.isInteger(Number(value)) ? 'El plazo debe ser un número entero de días.' : '');
  });

  protected readonly calculation = computed<OfferCalculation | null>(() => {
    if (this.amountError() || this.costError() || this.daysError()) return null;
    const amount = Number(this.amount());
    const cost = Number(this.cost());
    const days = Number(this.days());
    const tae = cost === 0 ? 0 : Math.round((Math.pow(1 + cost / amount, 365 / days) - 1) * 100);
    return { amount, cost, days, total: amount + cost, tae };
  });

  protected readonly referenceRows: readonly ReferenceRow[] = REFERENCE_TERMS.map((days) => {
    const loan = calculateLoan(100, days);
    return {
      days,
      newCost: loan.newCustomer.interest,
      newTae: Math.round(loan.newCustomer.tae),
      returningCost: loan.returningCustomer.interest,
      returningTae: Math.round(loan.returningCustomer.tae),
    };
  });

  protected setAmount(value: string): void {
    this.amount.set(value);
  }

  protected setCost(value: string): void {
    this.cost.set(value);
  }

  protected setDays(value: string): void {
    this.days.set(value);
  }

  protected showResult(): void {
    document.getElementById('apr-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private validate(value: string, min: number, max: number, message: string): string {
    if (value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) {
      return message;
    }
    return '';
  }
}
