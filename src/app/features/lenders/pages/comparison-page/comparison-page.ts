import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs';
import { SimulationState } from '../../../../common/simulation-state';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LendersService } from '../../data-access/lenders.service';
import { Lender, LenderFilters, LenderSort } from '../../models/lenders.models';

type FilterField = 'amount' | 'termDays' | 'age';

@Component({
  selector: 'app-comparison-page',
  imports: [DecimalPipe, RouterLink, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './comparison-page.html',
  styleUrl: './comparison-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonPage {
  private readonly lenders = inject(LendersService);
  private readonly simulation = inject(SimulationState);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly params = this.route.snapshot.queryParamMap;
  private readonly saved = this.simulation.selection();
  protected readonly amount = signal(this.params.has('amount') ? this.params.get('amount') ?? '' : this.params.keys.length === 0 ? String(this.saved?.amount ?? '') : '');
  protected readonly termDays = signal(this.params.has('termDays') ? this.params.get('termDays') ?? '' : this.params.keys.length === 0 ? String(this.saved?.days ?? '') : '');
  protected readonly age = signal(this.params.get('age') ?? '');
  protected readonly firstLoanFree = signal(this.params.get('firstLoanFree') === 'true');
  protected readonly asnef = signal(this.params.get('asnef') === 'true');
  protected readonly noPayslip = signal(this.params.get('noPayslip') === 'true');
  protected readonly sort = signal<LenderSort>(this.parseSort(this.params.get('sort')));
  protected readonly filtersOpen = signal(false);
  protected readonly count = computed(() => [this.amount(), this.termDays(), this.age(), this.firstLoanFree(), this.asnef(), this.noPayslip()].filter(Boolean).length);
  protected readonly amountError = computed(() => this.validation('amount', this.amount()));
  protected readonly termError = computed(() => this.validation('termDays', this.termDays()));
  protected readonly ageError = computed(() => this.validation('age', this.age()));
  protected readonly canSortTotal = computed(() => this.amount() !== '' && this.termDays() !== '' && !this.amountError() && !this.termError());
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => {
    const amount = this.amount();
    const termDays = this.termDays();
    const age = this.age();
    const invalid = !!this.validation('amount', amount) || !!this.validation('termDays', termDays) || !!this.validation('age', age);
    const filters: LenderFilters = {
      sort: this.sort() === 'total' && (!amount || !termDays) ? 'recommended' : this.sort(),
      page: 0, size: 100,
      ...(amount ? { amount: Number(amount) } : {}),
      ...(termDays ? { termDays: Number(termDays) } : {}),
      ...(age ? { age: Number(age) } : {}),
      ...(this.firstLoanFree() ? { firstLoanFree: true } : {}),
      ...(this.asnef() ? { asnef: true } : {}),
      ...(this.noPayslip() ? { noPayslip: true } : {}),
    };
    return { filters, invalid, reload: this.reloadCount() };
  });
  protected readonly state = toSignal(toObservable(this.request).pipe(
    debounceTime(400),
    switchMap(({ filters, invalid }) => invalid
      ? toLoadState(this.lenders.listLenders({ sort: 'recommended', page: 0, size: 100 }))
      : toLoadState(this.lenders.listLenders(filters))),
  ), { initialValue: { status: 'loading' } as LoadState<Page<Lender>> });

  private parseSort(value: string | null): LenderSort {
    return value === 'total' || value === 'maxAmount' || value === 'response' ? value : 'recommended';
  }

  private validation(field: FilterField, value: string): string {
    if (!value) return '';
    const number = Number(value);
    if (field === 'amount' && (!Number.isFinite(number) || number < 50 || number > 2000)) return 'El importe debe estar entre 50 € y 2.000 €.';
    if (field === 'termDays' && (!Number.isInteger(number) || number < 7 || number > 90)) return 'El plazo debe estar entre 7 y 90 días.';
    if (field === 'age' && (!Number.isInteger(number) || number < 18 || number > 100)) return 'La edad debe estar entre 18 y 100 años.';
    return '';
  }

  protected change(field: FilterField, value: string): void {
    if (field === 'amount') this.amount.set(value);
    if (field === 'termDays') this.termDays.set(value);
    if (field === 'age') this.age.set(value);
    this.syncUrl();
  }

  protected toggle(field: 'firstLoanFree' | 'asnef' | 'noPayslip', checked: boolean): void {
    if (field === 'firstLoanFree') this.firstLoanFree.set(checked);
    if (field === 'asnef') this.asnef.set(checked);
    if (field === 'noPayslip') this.noPayslip.set(checked);
    this.syncUrl();
  }

  protected changeSort(value: string): void {
    this.sort.set(this.parseSort(value));
    this.syncUrl();
  }

  protected clear(): void {
    this.amount.set('');
    this.termDays.set('');
    this.age.set('');
    this.firstLoanFree.set(false);
    this.asnef.set(false);
    this.noPayslip.set(false);
    this.sort.set('recommended');
    this.syncUrl();
  }

  private syncUrl(): void {
    if (this.amountError() || this.termError() || this.ageError()) return;
    void this.router.navigate([], { relativeTo: this.route, replaceUrl: true, queryParams: {
      amount: this.amount() || null, termDays: this.termDays() || null, age: this.age() || null,
      firstLoanFree: this.firstLoanFree() ? 'true' : null, asnef: this.asnef() ? 'true' : null,
      noPayslip: this.noPayslip() ? 'true' : null, sort: this.sort() === 'recommended' ? null : this.sort(),
    } });
  }

  protected retry(): void {
    this.reloadCount.update((value) => value + 1);
  }

  protected requestAmount(): number {
    return this.amount() && !this.amountError() ? Number(this.amount()) : this.simulation.getSelection(300, 30).amount;
  }

  protected requestDays(): number {
    return this.termDays() && !this.termError() ? Number(this.termDays()) : this.simulation.getSelection(300, 30).days;
  }

  protected responseTime(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${Number((minutes / 60).toFixed(1)).toString().replace('.', ',')} h`;
  }
}
