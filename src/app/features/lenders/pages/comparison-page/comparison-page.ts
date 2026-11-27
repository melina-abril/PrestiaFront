import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, of, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { SimulationSession } from '../../../loan-common/simulation-session.service';
import { LenderCard } from '../../components/lender-card';
import { LendersService } from '../../data-access/lenders.service';
import { LenderFilters, LenderOrder, LenderResponse } from '../../models/lenders.models';

type NumericField = 'amount' | 'termDays' | 'age';

@Component({
  selector: 'app-comparison-page',
  imports: [ReactiveFormsModule, RouterLink, LenderCard, LoadingState, EmptyState, ErrorAlert],
  templateUrl: './comparison-page.html',
  styleUrl: './comparison-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonPage {
  private readonly service = inject(LendersService);
  private readonly session = inject(SimulationSession);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly builder = inject(NonNullableFormBuilder);
  private readonly query = this.route.snapshot.queryParamMap;
  private readonly hasQuery = this.query.keys.length > 0;
  private readonly saved = !this.hasQuery && typeof sessionStorage !== 'undefined' && sessionStorage.getItem('credara.simulacion') !== null
    ? this.session.load(this.session.homeDefaults) : null;

  protected readonly form = this.builder.group({
    amount: this.query.get('amount') ?? (this.saved ? String(this.saved.amount) : ''),
    termDays: this.query.get('termDays') ?? (this.saved ? String(this.saved.termDays) : ''),
    age: this.query.get('age') ?? '',
    firstLoanFree: this.query.get('firstLoanFree') === 'true',
    acceptsAsnef: this.query.get('acceptsAsnef') === 'true',
    noPayslip: this.query.get('noPayslip') === 'true',
    order: (this.isOrder(this.query.get('order')) ? this.query.get('order') : 'recommended') as LenderOrder,
  });
  private readonly applied = signal(this.form.getRawValue());
  private readonly reloadCount = signal(0);
  protected readonly filtersOpen = signal(false);
  protected readonly page = signal(0);
  protected readonly errors = computed(() => {
    const { amount, termDays, age } = this.applied();
    return {
      amount: this.rangeError(amount, 50, 2000, 'El importe debe estar entre 50 € y 2.000 €.'),
      termDays: this.rangeError(termDays, 7, 90, 'El plazo debe estar entre 7 y 90 días.'),
      age: this.rangeError(age, 18, 100, 'La edad debe estar entre 18 y 100 años.'),
    };
  });
  protected readonly activeCount = computed(() => {
    const f = this.applied();
    return Number(f.amount !== '') + Number(f.termDays !== '') + Number(f.age !== '') + Number(f.firstLoanFree) + Number(f.acceptsAsnef) + Number(f.noPayslip);
  });
  protected readonly request = computed(() => {
    const f = this.applied();
    const filters: LenderFilters = { order: f.order, page: this.page(), size: 20 };
    if (f.amount !== '') filters.amount = Number(f.amount);
    if (f.termDays !== '') filters.termDays = Number(f.termDays);
    if (f.age !== '') filters.age = Number(f.age);
    if (f.firstLoanFree) filters.firstLoanFree = true;
    if (f.acceptsAsnef) filters.acceptsAsnef = true;
    if (f.noPayslip) filters.noPayslip = true;
    return { filters, valid: !Object.values(this.errors()).some(Boolean), reload: this.reloadCount() };
  });
  protected readonly state = toSignal(
    toObservable(this.request).pipe(switchMap(({ filters, valid }) => valid
      ? toLoadState(this.service.list(filters))
      : of<LoadState<Page<LenderResponse>>>({ status: 'empty' }))),
    { initialValue: { status: 'loading' } as LoadState<Page<LenderResponse>> },
  );
  protected readonly applicationRoute = '/applications';

  constructor() {
    this.form.valueChanges.pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.apply());
  }

  protected errorFor(field: NumericField): string {
    const value = this.form.controls[field].value;
    const config = {
      amount: [50, 2000, 'El importe debe estar entre 50 € y 2.000 €.'] as const,
      termDays: [7, 90, 'El plazo debe estar entre 7 y 90 días.'] as const,
      age: [18, 100, 'La edad debe estar entre 18 y 100 años.'] as const,
    }[field];
    return this.rangeError(value, ...config);
  }

  protected clear(): void {
    this.form.setValue({ amount: '', termDays: '', age: '', firstLoanFree: false, acceptsAsnef: false, noPayslip: false, order: 'recommended' }, { emitEvent: false });
    this.apply();
  }

  protected reload(): void { this.reloadCount.update((n) => n + 1); }
  protected goToPage(page: number): void { this.page.set(page); }
  protected toggleFilters(): void { this.filtersOpen.update((open) => !open); }
  protected requestAmount(): number { return this.request().filters.amount ?? this.session.load(this.session.homeDefaults).amount; }
  protected requestTerm(): number { return this.request().filters.termDays ?? this.session.load(this.session.homeDefaults).termDays; }

  protected apply(): void {
    const value = this.form.getRawValue();
    this.applied.set(value);
    this.page.set(0);
    const queryParams: Record<string, string | null> = {
      amount: value.amount || null, termDays: value.termDays || null, age: value.age || null,
      firstLoanFree: value.firstLoanFree ? 'true' : null,
      acceptsAsnef: value.acceptsAsnef ? 'true' : null,
      noPayslip: value.noPayslip ? 'true' : null,
      order: value.order === 'recommended' ? null : value.order,
    };
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private rangeError(value: string, min: number, max: number, message: string): string {
    return value !== '' && (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) ? message : '';
  }

  private isOrder(value: string | null): value is LenderOrder {
    return value === 'recommended' || value === 'total' || value === 'maxAmount' || value === 'response';
  }
}
