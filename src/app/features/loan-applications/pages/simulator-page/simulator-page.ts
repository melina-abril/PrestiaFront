import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoanDraftService } from '../../data-access/loan-draft.service';
import { calculateLoan, repaymentDate } from '../../models/loan-applications.models';

@Component({
  selector: 'app-simulator-page',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './simulator-page.html',
  styleUrl: './simulator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorPage {
  private readonly draftService = inject(LoanDraftService);
  protected readonly draft = this.draftService.draft;
  protected readonly newLoan = computed(() => calculateLoan(this.draft().amount, this.draft().termDays, true));
  protected readonly recurringLoan = computed(() => calculateLoan(this.draft().amount, this.draft().termDays, false));
  protected readonly dueDate = computed(() => repaymentDate(this.draft().termDays));
  protected readonly terms = [7, 15, 30, 60, 90].map((days) => ({
    days, first: calculateLoan(500, days, true), recurring: calculateLoan(500, days, false),
  }));

  protected setAmount(value: string): void {
    const amount = Number(value);
    if (Number.isInteger(amount) && amount >= 50 && amount <= 2000 && amount % 50 === 0) {
      this.draftService.update({ amount });
    }
  }

  protected setTerm(value: string): void {
    const termDays = Number(value);
    if (Number.isInteger(termDays) && termDays >= 7 && termDays <= 90) {
      this.draftService.update({ termDays });
    }
  }
}
