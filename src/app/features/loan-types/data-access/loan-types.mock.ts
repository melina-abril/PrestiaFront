import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { LoanTypeLenderResponse, LoanTypeResponse, LoanTypeSummaryResponse } from '../models/loan-types.models';

const summaries: LoanTypeSummaryResponse[] = [
  { slug: 'rapidos', title: 'Préstamos rápidos', icon: '⚡', summary: 'Compara opciones para gastos imprevistos antes de decidir.' },
  { slug: 'online', title: 'Préstamos online', icon: '⌁', summary: 'Consulta entidades con solicitud por internet.' },
  { slug: 'sin-nomina', title: 'Préstamos sin nómina', icon: '◇', summary: 'Conoce las opciones que no exigen una nómina.' },
  { slug: 'con-asnef', title: 'Préstamos con ASNEF', icon: '◈', summary: 'Descubre entidades que estudian solicitudes con ASNEF.' },
  { slug: 'urgentes', title: 'Préstamos urgentes', icon: '⏱', summary: 'Compara entidades con tiempos de respuesta cortos.' },
  { slug: 'sin-intereses', title: 'Préstamos sin intereses', icon: '€', summary: 'Revisa opciones con primera financiación sin intereses.' },
  { slug: '300-euros', title: 'Préstamos de 300 €', icon: '3', summary: 'Encuentra entidades que admiten solicitudes de 300 €.' },
  { slug: '500-euros', title: 'Préstamos de 500 €', icon: '5', summary: 'Compara opciones para solicitar 500 €.' },
  { slug: '1000-euros', title: 'Préstamos de 1.000 €', icon: '1', summary: 'Consulta entidades que permiten solicitar 1.000 €.' },
];

const lenders: LoanTypeLenderResponse[] = [
  { id: 'vivus', name: 'Vivus', initials: 'VI', minAmount: 50, maxAmount: 1000, minTermDays: 7, maxTermDays: 30, minAge: 21, maxAge: 75, firstLoanFree: true, acceptsAsnef: false, noPayslip: true, responseMinutes: 15, recommended: true },
  { id: 'dineo', name: 'Dineo', initials: 'DI', minAmount: 50, maxAmount: 2000, minTermDays: 7, maxTermDays: 90, minAge: 18, maxAge: 80, firstLoanFree: false, acceptsAsnef: true, noPayslip: true, responseMinutes: 25, recommended: false },
  { id: 'moneyman', name: 'MoneyMan', initials: 'MO', minAmount: 100, maxAmount: 1500, minTermDays: 7, maxTermDays: 60, minAge: 20, maxAge: 70, firstLoanFree: true, acceptsAsnef: false, noPayslip: false, responseMinutes: 35, recommended: false },
];

function applicableLenders(slug: string): LoanTypeLenderResponse[] {
  if (slug === 'con-asnef') return lenders.filter((lender) => lender.acceptsAsnef);
  if (slug === 'sin-nomina') return lenders.filter((lender) => lender.noPayslip);
  if (slug === 'sin-intereses') return lenders.filter((lender) => lender.firstLoanFree);
  if (slug === 'urgentes') return lenders.filter((lender) => lender.responseMinutes <= 30);
  const amount = slug === '300-euros' ? 300 : slug === '500-euros' ? 500 : slug === '1000-euros' ? 1000 : null;
  if (amount !== null) return lenders.filter((lender) => lender.minAmount <= amount && lender.maxAmount >= amount);
  return lenders;
}

export function listLoanTypesMock(): Observable<LoanTypeSummaryResponse[]> {
  return mockResponse(summaries);
}

export function getLoanTypeMock(slug: string): Observable<LoanTypeResponse> {
  const summary = summaries.find((item) => item.slug === slug);
  if (!summary) return mockError(404, 'No encontramos esta página.');
  return mockResponse({
    ...summary,
    subtitle: `Consulta opciones de ${summary.title.toLowerCase()}. Revisa el coste total, los requisitos y el plazo antes de solicitar.`,
    tags: ['Solicitud online', 'Comparación gratuita', 'Condiciones claras'],
    criterion: slug === 'con-asnef' ? 'aceptaAsnef' : slug === 'sin-nomina' ? 'sinNomina' : slug === 'urgentes' ? 'respuestaMax30' : slug === 'sin-intereses' ? 'primerPrestamoGratis' : slug.endsWith('-euros') ? `importe:${slug.split('-')[0]}` : 'todas',
    requirements: ['Ser mayor de edad y residir en España.', 'Contar con documento de identidad vigente.', 'Tener una cuenta bancaria a tu nombre.', 'Acreditar ingresos si la entidad lo solicita.'],
    advantages: ['Puedes comparar varias entidades antes de elegir.', 'Puedes hacer la solicitud desde casa.'],
    disadvantages: ['Los plazos cortos pueden encarecer el préstamo.', 'Un retraso puede generar costes adicionales.'],
    questions: [
      { question: '¿Cuánto tarda en aprobarse una solicitud?', answer: 'Depende de la entidad y de la documentación solicitada. Una solicitud online no garantiza la aprobación.' },
      { question: '¿Qué debo revisar antes de aceptarla?', answer: 'Comprueba la TAE, el importe total a devolver, el vencimiento y las posibles comisiones.' },
      { question: '¿Credara concede el préstamo?', answer: 'No. Credara compara opciones; la evaluación y la contratación corresponden a cada entidad.' },
    ],
    related: summaries.filter((item) => item.slug !== slug).slice(0, 4).map(({ slug: relatedSlug, title }) => ({ slug: relatedSlug, title })),
    metaTitle: `${summary.title} | Compara opciones en Credara`,
    metaDescription: `${summary.summary} Consulta requisitos, entidades y preguntas frecuentes en Credara.`,
    lenders: applicableLenders(slug),
  });
}
