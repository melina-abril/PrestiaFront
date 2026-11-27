import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { ApplicationCreatedResponse, ApplicationOffersResponse, ApplicationRequest, OfferClickResponse } from '../models/loan-applications.models';
import { createApplicationMock, getApplicationOffersMock, recordOfferClickMock } from './loan-applications.mock';

@Injectable({ providedIn: 'root' })
export class LoanApplicationsService {
  private readonly http = inject(HttpClient);

  createApplication(request: ApplicationRequest, key: string): Observable<ApplicationCreatedResponse> {
    if (environment.useMock) return createApplicationMock(request, key);
    return this.http.post<ApplicationCreatedResponse>(apiUrl('/applications'), request, { headers: { 'Idempotency-Key': key } });
  }

  getApplicationOffers(id: string): Observable<ApplicationOffersResponse> {
    if (environment.useMock) return getApplicationOffersMock(id);
    return this.http.get<ApplicationOffersResponse>(apiUrl(`/applications/${encodeURIComponent(id)}/offers`));
  }

  recordOfferClick(id: string, lenderId: string): Observable<OfferClickResponse> {
    if (environment.useMock) return recordOfferClickMock(id, lenderId);
    return this.http.post<OfferClickResponse>(apiUrl(`/applications/${encodeURIComponent(id)}/clicks`), { lenderId });
  }
}
