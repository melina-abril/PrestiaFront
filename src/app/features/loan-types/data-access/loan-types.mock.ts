import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanTypeLenderResponse, LoanTypeResponse, LoanTypeSummaryResponse } from '../models/loan-types.models';

const types: readonly LoanTypeSummaryResponse[] = [
  { slug: 'rapidos', title: 'Préstamos rápidos', icon: '⚡', summary: 'Compara opciones para afrontar un gasto imprevisto.' },
  { slug: 'online', title: 'Préstamos online', icon: '◈', summary: 'Consulta entidades con solicitud por internet.' },
  { slug: 'sin-nomina', title: 'Préstamos sin nómina', icon: '◇', summary: 'Descubre opciones que no exigen nómina.' },
  { slug: 'con-asnef', title: 'Préstamos con ASNEF', icon: '✓', summary: 'Compara entidades que estudian perfiles con ASNEF.' },
  { slug: 'urgentes', title: 'Préstamos urgentes', icon: '↗', summary: 'Consulta entidades con tiempos de respuesta cortos.' },
  { slug: 'sin-intereses', title: 'Préstamos sin intereses', icon: '◎', summary: 'Explora promociones para un primer préstamo.' },
  { slug: '300-euros', title: 'Préstamos de 300 €', icon: '€', summary: 'Compara opciones para solicitar 300 €.' },
  { slug: '500-euros', title: 'Préstamos de 500 €', icon: '€', summary: 'Compara opciones para solicitar 500 €.' },
  { slug: '1000-euros', title: 'Préstamos de 1.000 €', icon: '€', summary: 'Compara opciones para solicitar 1.000 €.' },
];

const lenders: readonly LoanTypeLenderResponse[] = [
  { id: 'vivus', name: 'Vivus', initials: 'VI', minAmount: 50, maxAmount: 1400, minTermDays: 7, maxTermDays: 60, minAge: 21, maxAge: 75, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'dineo', name: 'Dineo', initials: 'DI', minAmount: 100, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 18, maxAge: 80, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 25, recommended: false },
  { id: 'credityes', name: 'CreditYes', initials: 'CR', minAmount: 200, maxAmount: 2000, minTermDays: 15, maxTermDays: 90, minAge: 21, maxAge: 70, firstLoanFree: false, acceptsAsnef: false, noPayslip: false, responseMinutes: 45, recommended: false },
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

function matches(lender: LoanTypeLenderResponse, criterion: string): boolean {
  if (criterion === 'sinNomina') return lender.noPayslip;
  if (criterion === 'aceptaAsnef') return lender.acceptsAsnef;
  if (criterion === 'respuestaMax30') return lender.responseMinutes <= 30;
  if (criterion === 'primerPrestamoGratis') return lender.firstLoanFree;
  if (criterion.startsWith('importe:')) {
    const amount = Number(criterion.slice(8));
    return amount >= lender.minAmount && amount <= lender.maxAmount;
  }
  return true;
}

export function listLoanTypesMock(): Observable<LoanTypeSummaryResponse[]> {
  return mockResponse([...types]);
}

export function getLoanTypeMock(slug: string): Observable<LoanTypeResponse> {
  const summary = types.find((item) => item.slug === slug);
  if (!summary) return mockError(404, 'No encontramos este tipo de préstamo.');
  const criterion = criterionFor(slug);
  const response: LoanTypeResponse = {
    ...summary,
    subtitle: `Consulta opciones de ${summary.title.toLowerCase()} y compara sus condiciones antes de decidir.`,
    tags: ['Solicitud online', 'Comparación gratuita', 'España'],
    criterion,
    requirements: ['Ser mayor de edad y residir en España.', 'Tener un documento de identidad vigente.', 'Disponer de una cuenta bancaria a tu nombre.'],
    advantages: ['Puedes comparar entidades antes de decidir.', 'La solicitud se realiza por internet.'],
    disadvantages: ['Los plazos cortos pueden aumentar el coste.', 'La aprobación depende del análisis de cada entidad.'],
    questions: [
      { question: `¿Cómo solicito ${summary.title.toLowerCase()}?`, answer: 'Compara las entidades, revisa las condiciones y envía una solicitud. Cada entidad decide si la aprueba.' },
      { question: '¿Qué debo revisar antes de aceptar?', answer: 'Comprueba la TAE, el total a devolver, el vencimiento y las consecuencias de un retraso.' },
      { question: '¿Credara concede préstamos?', answer: 'No. Credara compara e intermedia; la contratación corresponde a cada entidad.' },
    ],
    related: types.filter((item) => item.slug !== slug).slice(0, 6).map(({ slug: relatedSlug, title }) => ({ slug: relatedSlug, title })),
    metaTitle: `${summary.title}: compara entidades | Credara`,
    metaDescription: `${summary.summary} Revisa requisitos, ventajas y entidades en Credara.`,
    lenders: lenders.filter((lender) => matches(lender, criterion)),
  };
  return mockResponse(response);
}
