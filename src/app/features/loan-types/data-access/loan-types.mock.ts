import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanTypeDetailResponse, LoanTypeLenderResponse, LoanTypeSummaryResponse } from '../models/loan-types.models';

const types: LoanTypeSummaryResponse[] = [
  { slug: 'rapidos', title: 'Préstamos rápidos', icon: '⚡', summary: 'Respuesta en minutos y dinero el mismo día.' },
  { slug: 'online', title: 'Préstamos online', icon: '💻', summary: 'Todo el trámite desde el móvil, sin papeles.' },
  { slug: 'sin-nomina', title: 'Préstamos sin nómina', icon: '📄', summary: 'Para pensionistas, autónomos u otros ingresos.' },
  { slug: 'con-asnef', title: 'Préstamos con ASNEF', icon: '🛡️', summary: 'Entidades que estudian solicitudes con ASNEF.' },
  { slug: 'urgentes', title: 'Préstamos urgentes', icon: '⏱️', summary: 'Entidades con respuesta en 30 minutos o menos.' },
  { slug: 'sin-intereses', title: 'Préstamos sin intereses', icon: '🎁', summary: 'Primer préstamo al 0 % durante 30 días.' },
  { slug: '300-euros', title: 'Préstamos de 300 €', icon: '3️⃣', summary: 'Entidades que prestan 300 € a clientes nuevos.' },
  { slug: '500-euros', title: 'Préstamos de 500 €', icon: '5️⃣', summary: 'Entidades que prestan 500 €.' },
  { slug: '1000-euros', title: 'Préstamos de 1.000 €', icon: '🔟', summary: 'Entidades que prestan 1.000 €.' },
];

const lenders: LoanTypeLenderResponse[] = [
  { id: 'prestamix', name: 'Prestamix', acronym: 'PX', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 30, minAge: 21, maxAge: 70, firstLoanFree: true, acceptsAsnef: true, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'monedia', name: 'Monedia', acronym: 'MO', minAmount: 50, maxAmount: 1200, minTermDays: 7, maxTermDays: 30, minAge: 21, maxAge: 70, firstLoanFree: true, acceptsAsnef: true, noPayslip: false, responseMinutes: 20, recommended: false },
  { id: 'kredo', name: 'Kredo', acronym: 'KR', minAmount: 100, maxAmount: 600, minTermDays: 7, maxTermDays: 30, minAge: 18, maxAge: 70, firstLoanFree: false, acceptsAsnef: true, noPayslip: false, responseMinutes: 30, recommended: false },
];

function lendersFor(slug: string): LoanTypeLenderResponse[] {
  if (slug === 'sin-nomina') return lenders.filter((lender) => lender.noPayslip);
  if (slug === 'sin-intereses') return lenders.filter((lender) => lender.firstLoanFree);
  if (slug === '1000-euros') return lenders.filter((lender) => lender.maxAmount >= 1000);
  return lenders;
}

export function listLoanTypesMock(): Observable<LoanTypeSummaryResponse[]> {
  return mockResponse(types);
}

export function getLoanTypeMock(slug: string): Observable<LoanTypeDetailResponse> {
  const type = types.find((item) => item.slug === slug);
  if (!type) return mockError(404, 'No encontramos esta página.');

  const isAsnef = slug === 'con-asnef';
  return mockResponse({
    ...type,
    subtitle: isAsnef
      ? 'Estar en un fichero de morosos no es un rechazo automático: estas entidades estudian cada caso.'
      : `${type.summary} Compara las condiciones antes de solicitarlo.`,
    tags: isAsnef ? ['Estudian tu caso', '100% online', 'Desde 100 €'] : ['Solicitud online', 'Compara gratis', 'Sin compromiso'],
    criterion: slug,
    requirements: isAsnef
      ? ['Ser mayor de edad (21 en algunas entidades)', 'DNI o NIE vigente y residencia en España', 'Cuenta bancaria a tu nombre', 'Móvil y correo electrónico', 'Deuda en ASNEF por debajo del límite de cada entidad']
      : ['Ser mayor de 18 años y residir en España', 'Disponer de DNI o NIE vigente', 'Tener una cuenta bancaria a tu nombre', 'Facilitar un móvil y un correo electrónico'],
    advantages: isAsnef ? ['Opción cuando el banco rechaza la solicitud', 'Respuesta rápida'] : ['Solicitud completamente online', 'Puedes comparar varias entidades gratis'],
    disadvantages: isAsnef ? ['Importes iniciales más bajos', 'Coste mayor que un préstamo bancario'] : ['La aprobación depende del análisis de la entidad', 'Revisa el coste total antes de aceptar'],
    questions: isAsnef
      ? [
          { question: '¿Me pueden dar un préstamo si estoy en ASNEF?', answer: 'Sí, algunas entidades estudian tu caso según el importe de la deuda y tus ingresos.' },
          { question: '¿Cuánto puedo pedir?', answer: 'Normalmente entre 100 € y 600 € la primera vez.' },
        ]
      : [
          { question: `¿Cómo puedo solicitar ${type.title.toLowerCase()}?`, answer: 'Compara las entidades, elige una oferta y completa la solicitud en la web de la entidad.' },
          { question: '¿La comparación tiene algún coste?', answer: 'No. Comparar y solicitar ofertas en Credara es gratis.' },
        ],
    metaTitle: `${type.title} | Comparar entidades | Credara`,
    metaDescription: `${type.summary} Compara entidades y condiciones gratis en Credara.`,
    related: types.filter((item) => item.slug !== slug).slice(0, 3).map(({ slug: relatedSlug, title }) => ({ slug: relatedSlug, title })),
    lenders: lendersFor(slug),
  });
}
