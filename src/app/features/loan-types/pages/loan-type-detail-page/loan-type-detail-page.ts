import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { SimulationSession } from '../../../loan-common/simulation-session.service';
import { LoanTypesService } from '../../data-access/loan-types.service';
import { LoanTypeResponse } from '../../models/loan-types.models';

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
  private readonly simulation = inject(SimulationSession);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));

  protected readonly selectedAmount = this.simulation.load({ amount: 300, termDays: 30 }).amount;
  protected readonly typeState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => toLoadState(this.service.getLoanType(slug).pipe(
        catchError((error: unknown) => error instanceof ApiProblemError && error.status === 404
          ? throwError(() => new Error('No encontramos esta página'))
          : throwError(() => error)),
      ))),
      tap((state) => {
        if (state.status === 'ready') {
          this.title.setTitle(state.data.metaTitle);
          this.meta.updateTag({ name: 'description', content: state.data.metaDescription });
        } else if (state.status === 'error') {
          this.title.setTitle('No encontramos esta página | Credara');
          this.meta.updateTag({ name: 'description', content: 'Explora los tipos de préstamo disponibles en Credara.' });
        }
      }),
    ),
    { initialValue: { status: 'loading' } as LoadState<LoanTypeResponse> },
  );

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected lenderHeading(title: string): string {
    return title.replace(/^Préstamos\s*/i, '').toLowerCase();
  }
}
