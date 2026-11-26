import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { LoanOfferResponse, LoanRequestCreatedResponse, LoanRequestInput, OfferClickResponse } from '../models/loan-requests.models';
import { createLoanRequestMock, getLoanRequestOffersMock, recordOfferClickMock } from './loan-requests.mock';

@Injectable({ providedIn: 'root' })
export class LoanRequestsService {
  private readonly http = inject(HttpClient);

  createLoanRequest(input: LoanRequestInput, idempotencyKey: string): Observable<LoanRequestCreatedResponse> {
    if (environment.useMock) return createLoanRequestMock(input, idempotencyKey);
    return this.http.post<LoanRequestCreatedResponse>(apiUrl('/api/loan-requests'), input, {
      headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
    });
  }

  getLoanRequestOffers(id: string): Observable<LoanOfferResponse[]> {
    if (environment.useMock) return getLoanRequestOffersMock(id);
    return this.http.get<LoanOfferResponse[]>(apiUrl(`/api/loan-requests/${encodeURIComponent(id)}/offers`));
  }

  recordOfferClick(id: string, lenderId: string): Observable<OfferClickResponse> {
    if (environment.useMock) return recordOfferClickMock(id, lenderId);
    return this.http.post<OfferClickResponse>(apiUrl(`/api/loan-requests/${encodeURIComponent(id)}/clicks`), { lenderId });
  }
}
