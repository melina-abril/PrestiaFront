import { LegalDocument } from './legal.models';

export const TERMS_AND_CONDITIONS: LegalDocument = {
  slug: 'terminos-condiciones',
  title: 'Términos y condiciones',
  updatedAt: '15/01/2026',
  sections: [
    { heading: 'Naturaleza del servicio', paragraphs: ['Credara permite comparar información sobre préstamos y presentar solicitudes a entidades. El servicio de comparación es gratuito para el visitante. Credara no presta dinero.'] },
    { heading: 'Simulaciones y ofertas', paragraphs: ['Los resultados de las calculadoras son orientativos. Las entidades determinan la aprobación, el coste y el resto de condiciones definitivas de sus productos.'] },
    { heading: 'Solicitudes', paragraphs: ['Proporciona datos correctos y revisa las condiciones de la entidad antes de contratar. Presentar una solicitud no supone la concesión de un préstamo.'] },
    { heading: 'Remuneración', paragraphs: ['Las entidades pueden pagar a Credara una comisión por las solicitudes que les presentamos. Este pago no supone un coste para el visitante.'] },
  ],
};
