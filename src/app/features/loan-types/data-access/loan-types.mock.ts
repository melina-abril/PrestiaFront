import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanTypeDetailResponse, LoanTypeLenderResponse, LoanTypeSummaryResponse } from '../models/loan-types.models';

const types: readonly LoanTypeSummaryResponse[] = [
  { slug: 'rapidos', title: 'Préstamos rápidos', icon: '⚡', summary: 'Compara entidades con solicitudes en línea y consulta sus tiempos de respuesta.' },
  { slug: 'online', title: 'Préstamos online', icon: '↗', summary: 'Explora opciones que puedes solicitar desde cualquier lugar.' },
  { slug: 'sin-nomina', title: 'Préstamos sin nómina', icon: '◈', summary: 'Consulta entidades que estudian otras fuentes de ingresos.' },
  { slug: 'con-asnef', title: 'Préstamos con ASNEF', icon: '✓', summary: 'Conoce entidades que consideran solicitudes de personas en ASNEF.' },
  { slug: 'urgentes', title: 'Préstamos urgentes', icon: '◷', summary: 'Revisa entidades con tiempos de respuesta publicados de hasta 30 minutos.' },
  { slug: 'sin-intereses', title: 'Préstamos sin intereses', icon: '☆', summary: 'Consulta entidades con promociones para el primer préstamo.' },
  { slug: '300-euros', title: 'Préstamos de 300 €', icon: '€', summary: 'Compara entidades que admiten solicitudes de 300 €.' },
  { slug: '500-euros', title: 'Préstamos de 500 €', icon: '€', summary: 'Compara entidades que admiten solicitudes de 500 €.' },
  { slug: '1000-euros', title: 'Préstamos de 1.000 €', icon: '€', summary: 'Compara entidades que admiten solicitudes de 1.000 €.' },
];

const lenders: readonly LoanTypeLenderResponse[] = [
  { id: 'vivus', name: 'Vivus', acronym: 'VI', minAmount: 50, maxAmount: 1400, minTermDays: 7, maxTermDays: 60, minAge: 21, maxAge: 75, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'moneyman', name: 'MoneyMan', acronym: 'MM', minAmount: 100, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 18, maxAge: 70, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 25, recommended: true },
  { id: 'dineo', name: 'Dineo', acronym: 'DI', minAmount: 50, maxAmount: 1000, minTermDays: 7, maxTermDays: 60, minAge: 18, maxAge: 75, firstLoanFree: false, acceptsAsnef: false, noPayslip: false, responseMinutes: 30, recommended: false },
];

function criterionFor(slug: string): string {
  switch (slug) {
    case 'sin-nomina': return 'sinNomina';
    case 'con-asnef': return 'aceptaAsnef';
    case 'urgentes': return 'respuestaMax30';
    case 'sin-intereses': return 'primerPrestamoGratis';
    case '300-euros': return 'importe:300';
    case '500-euros': return 'importe:500';
    case '1000-euros': return 'importe:1000';
    default: return 'todas';
  }
}

function matchingLenders(criterion: string): LoanTypeLenderResponse[] {
  return lenders.filter((lender) => {
    if (criterion === 'sinNomina') return lender.noPayslip;
    if (criterion === 'aceptaAsnef') return lender.acceptsAsnef;
    if (criterion === 'respuestaMax30') return lender.responseMinutes <= 30;
    if (criterion === 'primerPrestamoGratis') return lender.firstLoanFree;
    if (criterion.startsWith('importe:')) {
      const amount = Number(criterion.slice('importe:'.length));
      return lender.minAmount <= amount && amount <= lender.maxAmount;
    }
    return true;
  }).sort((a, b) => Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name));
}

export function listLoanTypesMock(): Observable<LoanTypeSummaryResponse[]> {
  return mockResponse([...types]);
}

export function getLoanTypeMock(slug: string): Observable<LoanTypeDetailResponse> {
  const summary = types.find((item) => item.slug === slug);
  if (!summary) return mockError(404, 'No encontramos esta página.');
  const criterion = criterionFor(slug);
  return mockResponse({
    ...summary,
    subtitle: `Consulta entidades que ofrecen ${summary.title.toLowerCase()}, revisa requisitos y compara las condiciones antes de decidir.`,
    tags: ['Comparación gratuita', 'Solicitud en línea', 'Sin compromiso'],
    criterion,
    requirements: [
      'Ser mayor de edad y residir en España.',
      'Disponer de un documento de identidad vigente.',
      'Tener una cuenta bancaria a tu nombre.',
      'Aportar los datos de ingresos que solicite la entidad.',
    ],
    advantages: ['Puedes comparar condiciones antes de enviar una solicitud.', 'La solicitud se realiza en línea, sin desplazamientos.'],
    disadvantages: ['Los plazos cortos pueden encarecer la financiación.', 'Un retraso en el pago puede generar recargos.'],
    questions: [
      { question: '¿Cuándo recibiré una respuesta?', answer: 'Depende de la entidad y de la documentación solicitada. Ninguna respuesta ni ingreso está garantizado.' },
      { question: '¿Qué coste tiene comparar en Credara?', answer: 'Comparar es gratis para ti. Credara puede recibir una comisión por las solicitudes presentadas a entidades.' },
      { question: '¿Qué debo comprobar antes de aceptar?', answer: 'Revisa la TAE, los intereses, el total a devolver, el plazo y los cargos por demora.' },
    ],
    metaTitle: `${summary.title} | Compara opciones | Credara`,
    metaDescription: summary.summary,
    related: types.filter((item) => item.slug !== slug).map(({ slug: relatedSlug, title }) => ({ slug: relatedSlug, title })),
    lenders: matchingLenders(criterion),
  });
}
