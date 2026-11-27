import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { LoanSimulationStore } from '../../../loan-simulator/shared/loan-simulation-store';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeResponse } from '../../models/loan-types.models';

@Component({
  selector: 'app-loan-type-detail-page',
  imports: [RouterLink, ErrorAlert],
  templateUrl: './loan-type-detail-page.html',
  styleUrl: './loan-type-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTypeDetailPage {
  readonly slug = input.required<string>();

  private readonly service = inject(LoanTypesService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly simulationStore = inject(LoanSimulationStore);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));
  protected readonly amount = computed(() => this.simulationStore.simulation()?.amount ?? 300);

  protected readonly detailState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => this.service.getLoanType(slug).pipe(
        map((data): LoadState<LoanTypeResponse> => ({ status: 'ready', data })),
        tap((state) => {
          if (state.status === 'ready') {
            this.title.setTitle(state.data.metaTitle);
            this.meta.updateTag({ name: 'description', content: state.data.metaDescription });
          }
        }),
        startWith({ status: 'loading' } as LoadState<LoanTypeResponse>),
        catchError((error: unknown) => {
          this.meta.removeTag('name="description"');
          if (error instanceof ApiProblemError && error.status === 404) {
            this.title.setTitle('No encontramos esta página | Credara');
            return of<LoadState<LoanTypeResponse>>({ status: 'error', message: 'NOT_FOUND' });
          }
          this.title.setTitle('Tipos de préstamo | Credara');
          return of<LoadState<LoanTypeResponse>>({ status: 'error', message: errorMessage(error) });
        }),
      )),
    ),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeResponse> },
  );

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
