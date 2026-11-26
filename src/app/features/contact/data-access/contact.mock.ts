import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ContactRequest, ContactResponse } from '../models/contact.models';

const submissionTimes: number[] = [];

export function createContactMessageMock(request: ContactRequest): Observable<ContactResponse> {
  if (request.web?.trim()) return mockResponse({ received: true });

  const now = Date.now();
  const recent = submissionTimes.filter((time) => now - time < 60 * 60 * 1000);
  submissionTimes.splice(0, submissionTimes.length, ...recent);
  if (submissionTimes.length >= 3) {
    return mockError(429, 'Has enviado demasiados mensajes. Inténtalo más tarde.');
  }

  if (request.nombre.trim().length < 2 || request.nombre.trim().length > 60 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.correo) ||
      (request.telefono !== undefined && request.telefono !== '' && !/^\+?[0-9]{9,15}$/.test(request.telefono)) ||
      !['DUDA_COMPARADOR', 'DATOS_PERSONALES', 'ENTIDAD', 'OTRO'].includes(request.motivo) ||
      request.mensaje.trim().length < 20 || request.mensaje.trim().length > 1000 ||
      request.aceptaPrivacidad !== true) {
    return mockError(422, 'Revisa los datos del formulario.');
  }

  submissionTimes.push(now);
  return mockResponse({ received: true });
}
