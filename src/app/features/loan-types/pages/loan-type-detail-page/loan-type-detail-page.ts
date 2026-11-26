import { CurrencyPipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadState } from '../../../../shared/models/load-state';
import { LoanSimulationService } from '../../../loan-requests/data-access/loan-simulation.service';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeDetailResponse } from '../../models/loan-types.models';

@Component({
  selector: 'app-loan-type-detail-page',
  imports: [RouterLink, CurrencyPipe, LowerCasePipe, ErrorAlert],
  templateUrl: './loan-type-detail-page.html',
  styleUrl: './loan-type-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTypeDetailPage {
  readonly slug = input.required<string>();

  private readonly service = inject(LoanTypesService);
  private readonly simulation = inject(LoanSimulationService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));

  protected readonly amount = this.simulation.get()?.amount ?? 300;
  protected readonly detailState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => this.service.get(slug).pipe(
        tap((detail) => {
          this.title.setTitle(detail.metaTitle);
          this.meta.updateTag({ name: 'description', content: detail.metaDescription });
        }),
        map((data): LoadState<LoanTypeDetailResponse> => ({ status: 'ready', data })),
        startWith({ status: 'loading' } as LoadState<LoanTypeDetailResponse>),
        catchError((error: unknown) => {
          const notFound = error instanceof ApiProblemError && error.status === 404;
          const message = notFound ? 'No encontramos esta página' : errorMessage(error);
          if (notFound) this.title.setTitle('No encontramos esta página | Credara');
          return of<LoadState<LoanTypeDetailResponse>>({ status: 'error', message });
        }),
      )),
    ),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeDetailResponse> },
  );

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected requestOffers(): void {
    const previous = this.simulation.get();
    this.simulation.set(this.amount, previous?.days ?? 30);
    void this.router.navigate(['/loan-requests']);
  }
}
