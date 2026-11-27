import type { LegalDocument } from '../legal.models';

/** Borrador informativo pendiente de aprobación por el área legal. */
export const PRIVACY_POLICY: LegalDocument = {
  slug: 'politica-privacidad',
  title: 'Política de privacidad',
  updatedAt: '15/01/2026',
  sections: [
    {
      title: '¿Qué datos recogemos?',
      paragraphs: [
        'Cuando solicitas ofertas, nos facilitas los datos de contacto y la información económica necesaria para tramitar tu solicitud. También tratamos datos técnicos imprescindibles para el funcionamiento y la seguridad del sitio.',
      ],
    },
    {
      title: '¿Para qué los utilizamos?',
      paragraphs: [
        'Utilizamos tus datos para gestionar la solicitud, analizar qué entidades pueden ofrecerte financiación y presentarla a las entidades correspondientes. Las cookies de análisis solo se utilizan si das tu consentimiento.',
      ],
    },
    {
      title: '¿Con quién compartimos tus datos?',
      paragraphs: [
        'Compartimos los datos necesarios con las entidades a las que se presenta tu solicitud. Cada entidad evaluará tu perfil y te informará de sus condiciones y de su propio tratamiento de datos antes de contratar.',
      ],
    },
    {
      title: 'Tus derechos',
      paragraphs: [
        'Puedes solicitar acceso, rectificación o supresión de tus datos, así como ejercer los demás derechos previstos en la normativa de protección de datos. Para hacerlo, visita nuestra página de contacto.',
      ],
    },
  ],
};
