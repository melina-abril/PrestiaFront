import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeSummaryResponse } from '../../models/loan-types.models';

@Component({
  selector: 'app-loan-types-page',
  imports: [RouterLink, EmptyState, ErrorAlert],
  templateUrl: './loan-types-page.html',
  styleUrl: './loan-types-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTypesPage {
  private readonly service = inject(LoanTypesService);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => this.reloadCount());
  protected readonly placeholders = [0, 1, 2, 3, 4, 5];

  protected readonly typesState = toSignal(
    toObservable(this.request).pipe(switchMap(() => toLoadState(this.service.listLoanTypes()))),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeSummaryResponse[]> },
  );

  constructor() {
    inject(Title).setTitle('Tipos de préstamo | Credara');
    inject(Meta).updateTag({ name: 'description', content: 'Elige el préstamo que se ajusta a tu situación y compara las entidades que lo ofrecen.' });
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
