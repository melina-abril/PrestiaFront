import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { ContactRequest, ContactResponse } from '../models/contact.models';
import { createContactMessageMock } from './contact.mock';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  createContactMessage(request: ContactRequest): Observable<ContactResponse> {
    if (environment.useMock) return createContactMessageMock(request);
    return this.http.post<ContactResponse>(apiUrl('/api/contacto'), request);
  }
}
