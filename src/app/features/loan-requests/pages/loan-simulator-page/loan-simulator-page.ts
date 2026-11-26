import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { LoanSimulationService } from '../../data-access/loan-simulation.service';
import { displaySimulation } from '../../models/simulation-display';

@Component({
  selector: 'app-loan-simulator-page',
  imports: [RouterLink, MoneyPipe, DatePipe, DecimalPipe],
  templateUrl: './loan-simulator-page.html',
  styleUrl: './loan-simulator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanSimulatorPage {
  private readonly stored = inject(LoanSimulationService);
  private readonly initial = this.stored.get();
  protected readonly amount = signal(this.initial?.amount ?? 500);
  protected readonly days = signal(this.initial?.days ?? 30);
  protected readonly calculation = computed(() => displaySimulation(this.amount(), this.days()));
  protected readonly terms = [7, 15, 30, 45, 60, 90] as const;
  protected readonly comparison = computed(() => this.terms.map((days) => displaySimulation(this.amount(), days)));

  protected changeAmount(value: string): void {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0) return;
    this.amount.set(amount);
    this.stored.set(amount, this.days());
  }

  protected changeDays(value: string): void {
    const days = Number(value);
    if (!Number.isInteger(days) || days < 7 || days > 90) return;
    this.days.set(days);
    this.stored.set(this.amount(), days);
  }

  protected saveSelection(): void {
    this.stored.set(this.amount(), this.days());
  }
}
