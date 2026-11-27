import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ContactRequest, ContactResponse } from '../models/contact.models';

let submissions: number[] = [];

export function createContactMessageMock(request: ContactRequest): Observable<ContactResponse> {
  if (request.web?.trim()) return mockResponse({ accepted: true });

  const now = Date.now();
  submissions = submissions.filter((time) => now - time < 60 * 60 * 1000);
  if (submissions.length >= 3) {
    return mockError(429, 'Has enviado demasiados mensajes. Inténtalo más tarde.');
  }
  if (request.name.trim().length < 2 || request.message.trim().length < 20 || !request.privacyAccepted) {
    return mockError(400, 'Revisa los campos del formulario.');
  }
  submissions.push(now);
  return mockResponse({ accepted: true });
}
