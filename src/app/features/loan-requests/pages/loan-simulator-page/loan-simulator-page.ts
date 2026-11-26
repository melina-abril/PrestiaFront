import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../../../common/loan-calculation';
import { SimulationState } from '../../../../common/simulation-state';

@Component({
  selector: 'app-loan-simulator-page',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './loan-simulator-page.html',
  styleUrl: './loan-simulator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanSimulatorPage {
  private readonly simulation = inject(SimulationState);
  private readonly initial = this.simulation.getSelection(500, 30);
  protected readonly amount = signal(this.initial.amount);
  protected readonly days = signal(this.initial.days);
  protected readonly result = computed(() => calculateLoan(this.amount(), this.days()));
  protected readonly savings = computed(() => this.result().returningInterest - this.result().newInterest);
  protected readonly newCapitalPercent = computed(() => Math.round(this.amount() / this.result().newTotal * 100));
  protected readonly returningCapitalPercent = computed(() => Math.round(this.amount() / this.result().returningTotal * 100));
  protected readonly terms = [7, 15, 30, 45, 60, 90] as const;
  protected readonly table = computed(() => this.terms.map((days) => ({ days, result: calculateLoan(this.amount(), days) })));

  protected changeAmount(value: string): void {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0) return;
    this.amount.set(amount);
    this.simulation.updateSelection(amount, this.days());
  }

  protected changeDays(value: string): void {
    const days = Number(value);
    if (!Number.isInteger(days) || days < 7 || days > 90) return;
    this.days.set(days);
    this.simulation.updateSelection(this.amount(), days);
  }
}
