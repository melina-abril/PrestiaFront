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

  createLoanApplication(request: LoanApplicationRequest, idempotencyKey: string): Observable<LoanApplicationCreatedResponse> {
    if (environment.useMock) return createLoanApplicationMock(request, idempotencyKey);
    return this.http.post<LoanApplicationCreatedResponse>(apiUrl('/api/loan-applications'), request, {
      headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
    });
  }

  getLoanApplicationOffers(id: string): Observable<LoanApplicationOffersResponse> {
    if (environment.useMock) return getLoanApplicationOffersMock(id);
    return this.http.get<LoanApplicationOffersResponse>(apiUrl(`/api/loan-applications/${encodeURIComponent(id)}/offers`));
  }
}
