import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { calculateLoan } from '../../../loan-common/loan-calculation';
import { SimulationSession } from '../../../loan-common/simulation-session.service';

@Component({
  selector: 'app-loan-simulator-page',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './loan-simulator-page.html',
  styleUrl: './loan-simulator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanSimulatorPage {
  private readonly session = inject(SimulationSession);
  private readonly initial = this.session.load(this.session.advancedDefaults);

  protected readonly amount = signal(this.initial.amount);
  protected readonly termDays = signal(this.initial.termDays);
  protected readonly calculation = computed(() => calculateLoan(this.amount(), this.termDays()));
  protected readonly saving = computed(() => this.calculation().returningCustomer.interest - this.calculation().newCustomer.interest);
  protected readonly terms: readonly number[] = [7, 15, 30, 45, 60, 90];
  protected readonly rows = computed(() => this.terms.map((days) => calculateLoan(this.amount(), days)));
  protected readonly newCapitalPercent = computed(() => Math.round(this.amount() / this.calculation().newCustomer.total * 100));
  protected readonly returningCapitalPercent = computed(() => Math.round(this.amount() / this.calculation().returningCustomer.total * 100));
  protected readonly amountFill = computed(() => (this.amount() - 50) / 1950 * 100);
  protected readonly termFill = computed(() => (this.termDays() - 7) / 83 * 100);

  protected changeAmount(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.amount.set(Math.max(50, Math.min(2000, Math.round(parsed / 50) * 50)));
    this.session.save(this.amount(), this.termDays());
  }

  protected changeTerm(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.termDays.set(Math.max(7, Math.min(90, Math.round(parsed))));
    this.session.save(this.amount(), this.termDays());
  }
}
