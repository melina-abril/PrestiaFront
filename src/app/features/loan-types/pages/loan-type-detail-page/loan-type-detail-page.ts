import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { SimulationState } from '../../../../common/simulation-state';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeDetailResponse } from '../../models/loan-types.models';

@Component({
  selector: 'app-loan-type-detail-page',
  imports: [RouterLink, CurrencyPipe, ErrorAlert, LoadingState],
  templateUrl: './loan-type-detail-page.html',
  styleUrl: './loan-type-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTypeDetailPage {
  readonly slug = input.required<string>();
  private readonly service = inject(LoanTypesService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly simulation = inject(SimulationState);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));

  protected readonly selectedAmount = computed(() => this.simulation.getSelection(300, 30).amount);
  protected readonly notFound = signal(false);
  protected readonly detailState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => {
        this.notFound.set(false);
        return toLoadState(this.service.getLoanType(slug).pipe(
          tap((detail) => {
            this.title.setTitle(detail.metaTitle);
            this.meta.updateTag({ name: 'description', content: detail.metaDescription });
          }),
          catchError((error: unknown) => {
            this.notFound.set(error instanceof ApiProblemError && error.status === 404);
            return throwError(() => error);
          }),
        ));
      }),
    ),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeDetailResponse> },
  );

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
