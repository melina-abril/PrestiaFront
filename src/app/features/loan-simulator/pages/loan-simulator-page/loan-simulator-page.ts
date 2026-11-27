import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../shared/loan-calculation';
import { LoanSimulationStore } from '../../shared/loan-simulation-store';

const TERMS: readonly number[] = [7, 15, 30, 45, 60, 90];

@Component({
  selector: 'app-loan-simulator-page',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './loan-simulator-page.html',
  styleUrl: './loan-simulator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanSimulatorPage {
  private readonly store = inject(LoanSimulationStore);
  private readonly initial = this.store.getInitial(500, 30);

  protected readonly amount = signal(this.initial.amount);
  protected readonly termDays = signal(this.initial.termDays);
  protected readonly result = computed(() => calculateLoan(this.amount(), this.termDays()));
  protected readonly savings = computed(() => this.result().returningCustomer.interest - this.result().newCustomer.interest);
  protected readonly newCapitalPercent = computed(() => Math.round(this.amount() / this.result().newCustomer.total * 100));
  protected readonly returningCapitalPercent = computed(() => Math.round(this.amount() / this.result().returningCustomer.total * 100));
  protected readonly amountFill = computed(() => `${(this.amount() - 50) / 1950 * 100}%`);
  protected readonly termFill = computed(() => `${(this.termDays() - 7) / 83 * 100}%`);
  protected readonly terms = computed(() => TERMS.map((termDays) => calculateLoan(this.amount(), termDays)));
  protected readonly applicationParams = computed(() => ({ amount: this.amount(), termDays: this.termDays() }));

  protected setAmount(raw: string): void {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 50 || value > 2000 || value % 50 !== 0) return;
    this.amount.set(value);
    this.store.save(value, this.termDays());
  }

  protected setTermDays(raw: string): void {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 7 || value > 90) return;
    this.termDays.set(value);
    this.store.save(this.amount(), value);
  }
}
