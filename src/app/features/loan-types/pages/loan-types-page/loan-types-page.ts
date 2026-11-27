import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeSummaryResponse } from '../../models/loan-types.models';

@Component({
  selector: 'app-loan-types-page',
  imports: [RouterLink, ErrorAlert],
  templateUrl: './loan-types-page.html',
  styleUrl: './loan-types-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTypesPage {
  private readonly service = inject(LoanTypesService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => this.reloadCount());

  protected readonly typesState = toSignal(
    toObservable(this.request).pipe(switchMap(() => toLoadState(this.service.listLoanTypes()))),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeSummaryResponse[]> },
  );

  constructor() {
    this.title.setTitle('Tipos de préstamo | Credara');
    this.meta.updateTag({ name: 'description', content: 'Explora los tipos de préstamo y compara las entidades que pueden ofrecerlos.' });
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
