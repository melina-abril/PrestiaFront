import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { Page } from '../../../shared/models/page';
import { LenderFilters, LenderResponse } from '../models/lenders.models';
import { listLendersMock } from './lenders.mock';

@Injectable({ providedIn: 'root' })
export class LendersService {
  private readonly http = inject(HttpClient);

  /** GET /api/lenders; featured=true devuelve hasta tres destacadas. */
  listLenders(filters: LenderFilters): Observable<Page<LenderResponse>> {
    if (environment.useMock) return listLendersMock(filters);
    let params = new HttpParams();
    if (filters.amount !== undefined) params = params.set('amount', filters.amount);
    if (filters.termDays !== undefined) params = params.set('termDays', filters.termDays);
    if (filters.age !== undefined) params = params.set('age', filters.age);
    if (filters.firstLoanFree) params = params.set('firstLoanFree', 'true');
    if (filters.asnef) params = params.set('asnef', 'true');
    if (filters.noPayslip) params = params.set('noPayslip', 'true');
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.featured) params = params.set('featured', 'true');
    return this.http.get<Page<LenderResponse>>(apiUrl('/api/lenders'), { params });
  }
}
