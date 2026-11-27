import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ContactRequest, ContactResponse } from '../models/contact.models';

const submissions: number[] = [];

export function createContactMessageMock(request: ContactRequest): Observable<ContactResponse> {
  if (request.web?.trim()) return mockResponse({ accepted: true });

  const now = Date.now();
  const recent = submissions.filter((time) => now - time < 60 * 60 * 1000);
  submissions.splice(0, submissions.length, ...recent);
  if (submissions.length >= 3) return mockError(429, 'Has enviado demasiados mensajes. Inténtalo más tarde.');
  if (request.name.trim().length < 2 || request.name.trim().length > 60) {
    return mockError(400, 'Revisa el nombre.', { name: ['Usa entre 2 y 60 caracteres.'] });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) || request.email.length > 254) {
    return mockError(400, 'Revisa el correo.', { email: ['Ingresa un correo válido.'] });
  }
  if (request.phone && !/^\+?[0-9]{9,15}$/.test(request.phone)) {
    return mockError(400, 'Revisa el teléfono.', { phone: ['Usa entre 9 y 15 dígitos, con un signo + inicial opcional.'] });
  }
  if (request.message.trim().length < 20 || request.message.trim().length > 1000) {
    return mockError(400, 'Revisa el mensaje.', { message: ['Usa entre 20 y 1.000 caracteres.'] });
  }
  submissions.push(now);
  return mockResponse({ accepted: true });
}
