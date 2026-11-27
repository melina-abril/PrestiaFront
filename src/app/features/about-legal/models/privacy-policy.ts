import { LegalDocument } from './legal.models';

export const PRIVACY_POLICY: LegalDocument = {
  slug: 'politica-privacidad',
  title: 'Política de privacidad',
  updatedAt: '15/01/2026',
  sections: [
    { heading: '¿Qué datos recogemos?', paragraphs: ['Cuando solicitas ofertas, facilitas datos de contacto y la información necesaria para tramitar tu solicitud. También se tratan datos técnicos imprescindibles para el funcionamiento y la seguridad del sitio.'] },
    { heading: '¿Para qué los utilizamos?', paragraphs: ['Utilizamos tus datos para gestionar la solicitud, analizar qué entidades pueden ofrecerte financiación y presentarla a las entidades correspondientes. Las cookies de análisis requieren tu consentimiento.'] },
    { heading: '¿Con quién compartimos tus datos?', paragraphs: ['Compartimos los datos necesarios con las entidades a las que se presenta tu solicitud. Cada entidad evaluará tu perfil y te informará de sus condiciones y del tratamiento de datos que realice.'] },
    { heading: 'Tus derechos', paragraphs: ['Puedes solicitar el acceso, la rectificación o la supresión de tus datos y ejercer los demás derechos previstos en la normativa de protección de datos. Consulta la página de contacto para dirigirte a Credara.'] },
  ],
};
