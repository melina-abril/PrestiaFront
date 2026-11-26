export type ContactReason = 'DUDA_COMPARADOR' | 'DATOS_PERSONALES' | 'ENTIDAD' | 'OTRO';

export interface ContactRequest {
  nombre: string;
  correo: string;
  telefono?: string;
  motivo: ContactReason;
  mensaje: string;
  aceptaPrivacidad: true;
  web?: string;
}

export interface ContactResponse {
  received: true;
}

export const CONTACT_REASON_OPTIONS: readonly { value: ContactReason; label: string }[] = [
  { value: 'DUDA_COMPARADOR', label: 'Duda sobre el comparador' },
  { value: 'DATOS_PERSONALES', label: 'Mis datos personales' },
  { value: 'ENTIDAD', label: 'Soy una entidad y quiero colaborar' },
  { value: 'OTRO', label: 'Otro' },
];
