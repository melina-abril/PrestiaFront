import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { LoanTypeDetailResponse, LoanTypeSummaryResponse } from '../models/loan-types.models';
import { getLoanTypeMock, listLoanTypesMock } from './loan-types.mock';

@Injectable({ providedIn: 'root' })
export class LoanTypesService {
  private readonly http = inject(HttpClient);

  /** GET /api/loan-types */
  list(): Observable<LoanTypeSummaryResponse[]> {
    if (environment.useMock) return listLoanTypesMock();
    return this.http.get<LoanTypeSummaryResponse[]>(apiUrl('/api/loan-types'));
  }

  /** GET /api/loan-types/:slug */
  get(slug: string): Observable<LoanTypeDetailResponse> {
    if (environment.useMock) return getLoanTypeMock(slug);
    return this.http.get<LoanTypeDetailResponse>(apiUrl(`/api/loan-types/${encodeURIComponent(slug)}`));
  }
}
