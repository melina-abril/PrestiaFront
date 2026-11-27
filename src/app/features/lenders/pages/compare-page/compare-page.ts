import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, of, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LoanSimulationStore } from '../../../loan-simulator/shared/loan-simulation-store';
import { LendersService } from '../../data-access/lenders.service';
import { EMPTY_FILTERS, Lender, LenderFilters, LenderOrder, responseTime } from '../../models/lenders.models';

function queryNumber(raw: string | null, min: number, max: number): number | null {
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

@Component({
  selector: 'app-compare-page',
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink, LoadingState, ErrorAlert, EmptyState],
  templateUrl: './compare-page.html',
  styleUrl: './compare-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePage {
  private readonly service = inject(LendersService);
  private readonly store = inject(LoanSimulationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly query = this.route.snapshot.queryParamMap;
  private readonly saved = this.store.simulation();
  private readonly hasQueryFilters = this.query.keys.some((key) => key !== 'order');
  protected readonly responseTime = responseTime;
  protected readonly filtersOpen = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    amount: [this.query.get('amount') ?? (!this.hasQueryFilters && this.saved ? String(this.saved.amount) : ''), [Validators.pattern(/^$|^\d+$/), Validators.min(50), Validators.max(2000)]],
    termDays: [this.query.get('termDays') ?? (!this.hasQueryFilters && this.saved ? String(this.saved.termDays) : ''), [Validators.pattern(/^$|^\d+$/), Validators.min(7), Validators.max(90)]],
    age: [this.query.get('age') ?? '', [Validators.pattern(/^$|^\d+$/), Validators.min(18), Validators.max(100)]],
    firstLoanFree: [this.query.get('firstLoanFree') === 'true'],
    acceptsAsnef: [this.query.get('acceptsAsnef') === 'true'],
    noPayslip: [this.query.get('noPayslip') === 'true'],
    order: [this.validOrder(this.query.get('order'))],
  });
  protected readonly applied = signal<LenderFilters>(this.filtersFromForm());
  protected readonly filterCount = computed(() => {
    const f = this.applied();
    return Number(f.amount !== null) + Number(f.termDays !== null) + Number(f.age !== null) + Number(f.firstLoanFree) + Number(f.acceptsAsnef) + Number(f.noPayslip);
  });
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ filters: this.applied(), reload: this.reloadCount() }));
  protected readonly lendersState = toSignal(
    toObservable(this.request).pipe(
      debounceTime(400),
      switchMap(({ filters }) => toLoadState(this.service.listLenders(filters))),
    ),
    { initialValue: { status: 'loading' } as LoadState<Page<Lender>> },
  );

  constructor() {
    this.form.valueChanges.pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.form.invalid) return;
      const filters = this.filtersFromForm();
      if (filters.order === 'total' && (filters.amount === null || filters.termDays === null)) {
        this.form.controls.order.setValue('recommended', { emitEvent: false });
        filters.order = 'recommended';
      }
      this.applied.set(filters);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          amount: filters.amount, termDays: filters.termDays, age: filters.age,
          firstLoanFree: filters.firstLoanFree ? 'true' : null,
          acceptsAsnef: filters.acceptsAsnef ? 'true' : null,
          noPayslip: filters.noPayslip ? 'true' : null,
          order: filters.order === 'recommended' ? null : filters.order,
        },
        replaceUrl: true,
      });
    });
  }

  protected errorFor(field: 'amount' | 'termDays' | 'age'): string {
    const control = this.form.controls[field];
    if (!control.invalid || !control.dirty) return '';
    if (field === 'amount') return 'El importe debe estar entre 50 € y 2.000 €.';
    if (field === 'termDays') return 'El plazo debe estar entre 7 y 90 días.';
    return 'La edad debe estar entre 18 y 100 años.';
  }

  protected clear(): void {
    this.form.reset({ amount: '', termDays: '', age: '', firstLoanFree: false, acceptsAsnef: false, noPayslip: false, order: 'recommended' });
  }

  protected retry(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected applicationParams(): { amount: number; termDays: number } {
    const filters = this.applied();
    return { amount: filters.amount ?? this.saved?.amount ?? 300, termDays: filters.termDays ?? this.saved?.termDays ?? 30 };
  }

  private validOrder(value: string | null): LenderOrder {
    return value === 'total' || value === 'maxAmount' || value === 'response' ? value : 'recommended';
  }

  private filtersFromForm(): LenderFilters {
    const value = this.form.getRawValue();
    return {
      amount: queryNumber(value.amount, 50, 2000),
      termDays: queryNumber(value.termDays, 7, 90),
      age: queryNumber(value.age, 18, 100),
      firstLoanFree: value.firstLoanFree,
      acceptsAsnef: value.acceptsAsnef,
      noPayslip: value.noPayslip,
      order: this.validOrder(value.order),
    };
  }
}
