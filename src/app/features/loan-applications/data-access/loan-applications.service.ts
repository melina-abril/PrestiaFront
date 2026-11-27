import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { createApplicationMock, getApplicationOffersMock, recordOfferClickMock } from './loan-applications.mock';
import { ApplicationCreatedResponse, ApplicationOffersResponse, ApplicationRequest, OfferClickResponse } from '../models/loan-applications.models';

@Injectable({ providedIn: 'root' })
export class LoanApplicationsService {
  private readonly http = inject(HttpClient);

  createApplication(request: ApplicationRequest, idempotencyKey: string): Observable<ApplicationCreatedResponse> {
    if (environment.useMock) return createApplicationMock(request, idempotencyKey);
    return this.http.post<ApplicationCreatedResponse>(apiUrl('/api/applications'), request, {
      headers: new HttpHeaders().set('Idempotency-Key', idempotencyKey),
    });
  }

  getApplicationOffers(id: string): Observable<ApplicationOffersResponse> {
    if (environment.useMock) return getApplicationOffersMock(id);
    return this.http.get<ApplicationOffersResponse>(apiUrl(`/api/applications/${encodeURIComponent(id)}/offers`));
  }

  recordOfferClick(id: string, lenderId: string): Observable<OfferClickResponse> {
    if (environment.useMock) return recordOfferClickMock(id, lenderId);
    return this.http.post<OfferClickResponse>(apiUrl(`/api/applications/${encodeURIComponent(id)}/clicks`), { lenderId });
  }
}
