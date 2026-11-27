import type { LegalDocument } from '../legal.models';

/** Borrador informativo pendiente de aprobación por el área legal. */
export const COOKIE_POLICY: LegalDocument = {
  slug: 'politica-cookies',
  title: 'Política de cookies',
  updatedAt: '15/01/2026',
  sections: [
    {
      title: '¿Qué son las cookies?',
      paragraphs: [
        'Las cookies son pequeños archivos que un sitio puede guardar en tu navegador. Algunas permiten que el sitio funcione; otras requieren tu autorización previa.',
      ],
    },
    {
      title: 'Cookies necesarias',
      paragraphs: [
        'Las cookies técnicas imprescindibles para el funcionamiento y la seguridad del sitio permanecen activas. No se utilizan para elaborar perfiles publicitarios.',
      ],
    },
    {
      title: 'Cookies de análisis',
      paragraphs: [
        'Solo podrán utilizarse si aceptas expresamente esta categoría. Puedes denegarla o cambiar tus preferencias en cualquier momento desde la configuración de cookies.',
      ],
    },
    {
      title: 'Cómo gestionar tus preferencias',
      paragraphs: [
        'Usa el botón «Configurar cookies» de esta página para revisar y guardar tu elección. También puedes borrar las cookies desde las opciones de tu navegador.',
      ],
    },
  ],
};
