import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ContactRequest, ContactResponse } from '../models/contact.models';

const submissionTimes: number[] = [];

export function createContactMessageMock(request: ContactRequest): Observable<ContactResponse> {
  if (request.web?.trim()) return mockResponse({ received: true });

  const now = Date.now();
  const recent = submissionTimes.filter((time) => now - time < 60 * 60 * 1000);
  submissionTimes.splice(0, submissionTimes.length, ...recent);
  if (submissionTimes.length >= 3) return mockError(429, 'Has enviado demasiados mensajes. Inténtalo más tarde.');

  const errors: Record<string, string[]> = {};
  if (request.nombre.trim().length < 2 || request.nombre.trim().length > 60) errors['nombre'] = ['Usa entre 2 y 60 caracteres.'];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.correo)) errors['correo'] = ['Ingresa un correo válido.'];
  if (request.telefono && !/^\+?[0-9]{9,15}$/.test(request.telefono)) errors['telefono'] = ['Ingresa entre 9 y 15 dígitos, con + inicial opcional.'];
  if (!['DUDA_COMPARADOR', 'DATOS_PERSONALES', 'ENTIDAD', 'OTRO'].includes(request.motivo)) errors['motivo'] = ['Selecciona un motivo válido.'];
  if (request.mensaje.trim().length < 20 || request.mensaje.trim().length > 1000) errors['mensaje'] = ['Usa entre 20 y 1.000 caracteres.'];
  if (request.aceptaPrivacidad !== true) errors['aceptaPrivacidad'] = ['Acepta la política de privacidad.'];
  if (Object.keys(errors).length) return mockError(422, 'Revisa los campos del formulario.', errors);

  submissionTimes.push(now);
  return mockResponse({ received: true });
}
