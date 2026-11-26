import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { LoanApplicationCreatedResponse, LoanApplicationOffersResponse, LoanApplicationRequest } from '../models/loan-applications.models';
import { createLoanApplicationMock, getLoanApplicationOffersMock } from './loan-applications.mock';

@Injectable({ providedIn: 'root' })
export class LoanApplicationsService {
  private readonly http = inject(HttpClient);

  /** POST /api/loan-applications. El entorno fijo ya agrega el prefijo /api. */
  createLoanApplication(request: LoanApplicationRequest, key: string): Observable<LoanApplicationCreatedResponse> {
    if (environment.useMock) return createLoanApplicationMock(request, key);
    return this.http.post<LoanApplicationCreatedResponse>(apiUrl('/loan-applications'), request, {
      headers: new HttpHeaders({ 'Idempotency-Key': key }),
    });
  }

  /** GET /api/loan-applications/:id/offers. */
  getLoanApplicationOffers(id: string): Observable<LoanApplicationOffersResponse> {
    if (environment.useMock) return getLoanApplicationOffersMock(id);
    return this.http.get<LoanApplicationOffersResponse>(apiUrl(`/loan-applications/${encodeURIComponent(id)}/offers`));
  }
}
