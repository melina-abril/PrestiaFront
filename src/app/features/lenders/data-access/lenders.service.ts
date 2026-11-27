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

  /** GET /api/lenders. featured=true ignora todos los demás filtros. */
  list(filters: LenderFilters): Observable<Page<LenderResponse>> {
    if (environment.useMock) return listLendersMock(filters);
    if (filters.featured) {
      return this.http.get<Page<LenderResponse>>(apiUrl('/api/lenders'), { params: new HttpParams().set('featured', 'true') });
    }
    let params = new HttpParams().set('page', filters.page).set('size', filters.size).set('order', filters.order);
    if (filters.amount !== undefined) params = params.set('amount', filters.amount);
    if (filters.termDays !== undefined) params = params.set('termDays', filters.termDays);
    if (filters.age !== undefined) params = params.set('age', filters.age);
    if (filters.firstLoanFree) params = params.set('firstLoanFree', 'true');
    if (filters.acceptsAsnef) params = params.set('acceptsAsnef', 'true');
    if (filters.noPayslip) params = params.set('noPayslip', 'true');
    return this.http.get<Page<LenderResponse>>(apiUrl('/api/lenders'), { params });
  }
}
