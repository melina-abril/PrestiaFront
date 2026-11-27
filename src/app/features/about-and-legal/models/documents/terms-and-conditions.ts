import type { LegalDocument } from '../legal.models';

/** Borrador informativo pendiente de aprobación por el área legal. */
export const TERMS_AND_CONDITIONS: LegalDocument = {
  slug: 'terminos-condiciones',
  title: 'Términos y condiciones',
  updatedAt: '15/01/2026',
  sections: [
    {
      title: 'Naturaleza del servicio',
      paragraphs: [
        'Credara permite simular costes, comparar entidades y presentar solicitudes de ofertas. El servicio de comparación es gratuito para quien lo utiliza. Credara no presta dinero ni garantiza la aprobación.',
      ],
    },
    {
      title: 'Solicitudes y ofertas',
      paragraphs: [
        'Al enviar una solicitud, proporciona información veraz y revisa los consentimientos mostrados en el formulario. Cada entidad decide si puede ofrecer financiación y comunica sus condiciones finales antes de cualquier contratación.',
      ],
    },
    {
      title: 'Costes e independencia',
      paragraphs: [
        'Las entidades pueden pagar a Credara por las solicitudes presentadas. La comparación de ofertas muestra el coste total a devolver; la remuneración recibida no determina ese orden.',
      ],
    },
    {
      title: 'Uso del sitio',
      paragraphs: [
        'Utiliza el sitio conforme a la ley y evita enviar información de terceras personas sin autorización. Una simulación es orientativa y no sustituye la información precontractual de la entidad.',
      ],
    },
  ],
};
