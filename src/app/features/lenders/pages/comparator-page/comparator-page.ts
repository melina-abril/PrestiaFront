import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, of, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LenderCard } from '../../components/lender-card';
import { LendersService } from '../../data-access/lenders.service';
import { LoanSimulationService } from '../../../loan-requests/data-access/loan-simulation.service';
import { LenderFilters, LenderResponse, LenderSort } from '../../models/lenders.models';

interface FilterFields {
  amount: string;
  termDays: string;
  age: string;
  firstLoanFree: boolean;
  asnef: boolean;
  noPayslip: boolean;
  sort: LenderSort;
}

@Component({
  selector: 'app-comparator-page',
  imports: [RouterLink, LenderCard, LoadingState, EmptyState, ErrorAlert],
  templateUrl: './comparator-page.html',
  styleUrl: './comparator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparatorPage {
  private readonly lenders = inject(LendersService);
  private readonly simulation = inject(LoanSimulationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly savedSimulation = this.simulation.get();
  private readonly query = this.route.snapshot.queryParamMap;
  private readonly hasUrlFilters = ['importe', 'plazo', 'edad', 'gratis', 'asnef', 'sinNomina'].some((key) => this.query.has(key));
  protected readonly fields = signal<FilterFields>({
    amount: this.query.get('importe') ?? (this.hasUrlFilters ? '' : String(this.savedSimulation?.amount ?? '')),
    termDays: this.query.get('plazo') ?? (this.hasUrlFilters ? '' : String(this.savedSimulation?.days ?? '')),
    age: this.query.get('edad') ?? '',
    firstLoanFree: this.query.get('gratis') === 'true',
    asnef: this.query.get('asnef') === 'true',
    noPayslip: this.query.get('sinNomina') === 'true',
    sort: this.readSort(this.query.get('orden')),
  });
  protected readonly filterOpen = signal(false);
  private readonly reloadCount = signal(0);
  protected readonly applied = signal(this.fields());
  protected readonly filterCount = computed(() => {
    const fields = this.fields();
    return [fields.amount, fields.termDays, fields.age, fields.firstLoanFree, fields.asnef, fields.noPayslip].filter(Boolean).length;
  });
  protected readonly errors = computed(() => {
    const fields = this.fields();
    return {
      amount: this.invalidNumber(fields.amount, 50, 2000, false) ? 'El importe debe estar entre 50 € y 2.000 €.' : '',
      termDays: this.invalidNumber(fields.termDays, 7, 90, true) ? 'El plazo debe estar entre 7 y 90 días.' : '',
      age: this.invalidNumber(fields.age, 18, 100, true) ? 'La edad debe estar entre 18 y 100 años.' : '',
    };
  });
  protected readonly valid = computed(() => !Object.values(this.errors()).some(Boolean));
  protected readonly totalSortAvailable = computed(() => {
    const fields = this.fields();
    return fields.amount !== '' && fields.termDays !== '' && this.valid();
  });
  protected readonly request = computed(() => ({ fields: this.applied(), reload: this.reloadCount() }));
  protected readonly lendersState = toSignal(
    toObservable(this.request).pipe(switchMap(({ fields }) => {
      const filters: LenderFilters = {
        sort: fields.sort,
        ...(fields.amount ? { amount: Number(fields.amount) } : {}),
        ...(fields.termDays ? { termDays: Number(fields.termDays) } : {}),
        ...(fields.age ? { age: Number(fields.age) } : {}),
        ...(fields.firstLoanFree ? { firstLoanFree: true } : {}),
        ...(fields.asnef ? { asnef: true } : {}),
        ...(fields.noPayslip ? { noPayslip: true } : {}),
      };
      return toLoadState(this.lenders.listLenders(filters));
    })),
    { initialValue: { status: 'loading' } as LoadState<Page<LenderResponse>> },
  );
  protected readonly requestAmount = computed(() => Number(this.applied().amount) || this.savedSimulation?.amount || 300);
  protected readonly requestDays = computed(() => Number(this.applied().termDays) || this.savedSimulation?.days || 30);

  constructor() {
    toObservable(this.fields).pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef)).subscribe((fields) => {
      if (this.invalidNumber(fields.amount, 50, 2000, false) ||
          this.invalidNumber(fields.termDays, 7, 90, true) ||
          this.invalidNumber(fields.age, 18, 100, true)) return;
      const next = { ...fields, sort: fields.sort === 'total' && (!fields.amount || !fields.termDays) ? 'recommended' as LenderSort : fields.sort };
      this.applied.set(next);
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: {
          importe: next.amount || null, plazo: next.termDays || null, edad: next.age || null,
          gratis: next.firstLoanFree ? 'true' : null, asnef: next.asnef ? 'true' : null,
          sinNomina: next.noPayslip ? 'true' : null, orden: next.sort === 'recommended' ? null : next.sort,
        },
      });
    });
  }

  private readSort(value: string | null): LenderSort {
    return value === 'total' || value === 'maxAmount' || value === 'response' ? value : 'recommended';
  }

  private invalidNumber(value: string, min: number, max: number, integer: boolean): boolean {
    if (value === '') return false;
    const number = Number(value);
    return !Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number));
  }

  protected setNumber(field: 'amount' | 'termDays' | 'age', value: string): void {
    this.fields.update((current) => ({ ...current, [field]: value }));
  }

  protected setFlag(field: 'firstLoanFree' | 'asnef' | 'noPayslip', checked: boolean): void {
    this.fields.update((current) => ({ ...current, [field]: checked }));
  }

  protected setSort(value: string): void {
    const sort = this.readSort(value);
    if (sort === 'total' && !this.totalSortAvailable()) return;
    this.fields.update((current) => ({ ...current, sort }));
  }

  protected clear(): void {
    this.fields.set({ amount: '', termDays: '', age: '', firstLoanFree: false, asnef: false, noPayslip: false, sort: 'recommended' });
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
