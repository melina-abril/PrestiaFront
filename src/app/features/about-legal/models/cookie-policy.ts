import { LegalDocument } from './legal.models';

export const COOKIE_POLICY: LegalDocument = {
  slug: 'politica-cookies',
  title: 'Política de cookies',
  updatedAt: '15/01/2026',
  sections: [
    { heading: '¿Qué son las cookies?', paragraphs: ['Las cookies y tecnologías similares permiten conservar determinadas preferencias en el navegador durante la visita.'] },
    { heading: 'Cookies necesarias', paragraphs: ['El sitio puede utilizar almacenamiento imprescindible para su funcionamiento y para recordar tus preferencias sobre cookies. Estas funciones no dependen del consentimiento para cookies opcionales.'] },
    { heading: 'Cookies opcionales', paragraphs: ['Las cookies de análisis, si se incorporan al sitio, solo deben activarse con tu consentimiento. Puedes rechazarlas o cambiar tu elección en cualquier momento.'] },
    { heading: 'Gestionar tus preferencias', paragraphs: ['Utiliza Configurar cookies para revisar tu elección. También puedes gestionar o eliminar los datos almacenados desde la configuración de tu navegador.'] },
  ],
};
