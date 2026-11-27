export type ContactReason = 'DUDA_COMPARADOR' | 'DATOS_PERSONALES' | 'ENTIDAD' | 'OTRO';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  reason: ContactReason;
  message: string;
  privacyAccepted: true;
  web?: string;
}

export interface ContactResponse {
  accepted: true;
}

export const CONTACT_REASONS: readonly { value: ContactReason; label: string }[] = [
  { value: 'DUDA_COMPARADOR', label: 'Duda sobre el comparador' },
  { value: 'DATOS_PERSONALES', label: 'Mis datos personales' },
  { value: 'ENTIDAD', label: 'Soy una entidad y quiero colaborar' },
  { value: 'OTRO', label: 'Otro' },
];
