import { LegalDocument } from './legal.models';

export const LEGAL_NOTICE: LegalDocument = {
  slug: 'aviso-legal',
  title: 'Aviso legal',
  updatedAt: '15/01/2026',
  sections: [
    { heading: 'Titular del sitio', paragraphs: ['La razón social, el NIF, el domicilio, los datos registrales y el correo electrónico del titular están pendientes de confirmación por el área legal de Credara. No deben interpretarse como datos publicados del titular.'] },
    { heading: 'Objeto y actividad', paragraphs: ['Credara ofrece información para comparar préstamos y presenta solicitudes a entidades financieras. Credara no concede créditos ni decide sobre su aprobación. Las condiciones finales corresponden exclusivamente a cada entidad.'] },
    { heading: 'Propiedad intelectual', paragraphs: ['Los contenidos y elementos gráficos del sitio están sujetos a los derechos que correspondan a sus respectivos titulares. Su reproducción o explotación requiere la autorización aplicable.'] },
    { heading: 'Responsabilidad', paragraphs: ['Las simulaciones son orientativas. Comprueba las condiciones definitivas directamente con la entidad antes de contratar. Credara no garantiza que una solicitud sea aprobada.'] },
    { heading: 'Ley aplicable y jurisdicción', paragraphs: ['Se aplica la normativa española, sin perjuicio de las normas imperativas de protección de las personas consumidoras y de la jurisdicción que legalmente les corresponda.'] },
  ],
};
