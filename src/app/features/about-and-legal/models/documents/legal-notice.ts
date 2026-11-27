import type { LegalDocument } from '../legal.models';

/** Borrador informativo: el titular debe completar y aprobar sus datos identificativos antes de publicarlo como texto definitivo. */
export const LEGAL_NOTICE: LegalDocument = {
  slug: 'aviso-legal',
  title: 'Aviso legal',
  updatedAt: '15/01/2026',
  sections: [
    {
      title: 'Titular del sitio',
      paragraphs: [
        'Credara es un sitio de comparación de préstamos. Razón social, NIF, domicilio, datos registrales y correo electrónico del titular: pendientes de confirmación por el área legal. Estos datos deben publicarse antes de ofrecer el servicio.',
      ],
    },
    {
      title: 'Objeto y actividad',
      paragraphs: [
        'Este sitio facilita información para comparar opciones de financiación y presentar solicitudes a entidades. Credara actúa como comparador e intermediario; no concede créditos ni decide su aprobación. Las condiciones definitivas corresponden a cada entidad.',
      ],
    },
    {
      title: 'Propiedad intelectual',
      paragraphs: [
        'Los contenidos y elementos del sitio están sujetos a los derechos de sus titulares. Su reproducción o distribución requiere la autorización que corresponda, salvo los usos permitidos por la ley.',
      ],
    },
    {
      title: 'Responsabilidad',
      paragraphs: [
        'La información publicada tiene carácter orientativo. Antes de contratar, revisa la documentación y las condiciones facilitadas por la entidad prestamista. La disponibilidad de una oferta no garantiza la concesión del préstamo.',
      ],
    },
    {
      title: 'Ley aplicable y jurisdicción',
      paragraphs: [
        'Se aplica la legislación española, sin perjuicio de los derechos que la normativa de consumidores reconozca a cada persona. Los órganos competentes se determinarán conforme a las normas legales aplicables.',
      ],
    },
  ],
};
