import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ArticleCategory, ArticleListQuery, ArticleListResponse, ArticleResponse, ArticleSummaryResponse } from '../models/blog.models';

const articles: ArticleSummaryResponse[] = [
  { slug: 'que-es-la-tae-y-como-comparar-prestamos', titulo: 'Qué es la TAE y cómo usarla para comparar préstamos', categoria: 'Educación financiera', resumen: 'Aprende a distinguir la TAE del TIN y a identificar el coste real antes de contratar.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-18T09:00:00Z', minutosLectura: 6 },
  { slug: 'prestamo-personal-o-linea-de-credito', titulo: 'Préstamo personal o línea de crédito: ¿cuál elegir?', categoria: 'Préstamos', resumen: 'Descubre las diferencias y elige la financiación que se ajuste a tus necesidades.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-15T09:00:00Z', minutosLectura: 5 },
  { slug: 'como-detectar-falsos-prestamistas', titulo: 'Cómo detectar falsos prestamistas en internet', categoria: 'Seguridad', resumen: 'Señales de alerta para protegerte antes de enviar una solicitud.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-11T09:00:00Z', minutosLectura: 7 },
  { slug: 'estar-en-asnef-y-solicitar-un-prestamo', titulo: 'Estar en ASNEF: qué significa para tu solicitud', categoria: 'ASNEF', resumen: 'Qué debes revisar si apareces en un fichero de morosidad.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-08T09:00:00Z', minutosLectura: 6 },
  { slug: 'presupuesto-mensual-en-cinco-pasos', titulo: 'Tu presupuesto mensual en cinco pasos sencillos', categoria: 'Consejos', resumen: 'Organiza tus ingresos y gastos antes de asumir una deuda.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-04T09:00:00Z', minutosLectura: 4 },
  { slug: 'derecho-de-desistimiento-en-prestamos', titulo: 'Desistir de un préstamo: plazos y derechos', categoria: 'Legal', resumen: 'Conoce las condiciones y los plazos para desistir de un préstamo.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-06-01T09:00:00Z', minutosLectura: 5 },
  { slug: 'cuanto-puedes-pagar-al-mes', titulo: '¿Cuánto puedes pagar al mes sin agobios?', categoria: 'Educación financiera', resumen: 'Calcula una cuota sostenible para tu economía.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-05-28T09:00:00Z', minutosLectura: 5 },
  { slug: 'comisiones-de-un-prestamo', titulo: 'Comisiones de un préstamo que conviene revisar', categoria: 'Préstamos', resumen: 'Identifica las comisiones antes de comparar ofertas.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-05-25T09:00:00Z', minutosLectura: 6 },
  { slug: 'proteger-tus-datos-al-pedir-financiacion', titulo: 'Protege tus datos al pedir financiación online', categoria: 'Seguridad', resumen: 'Consejos para compartir tus datos de forma segura.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-05-21T09:00:00Z', minutosLectura: 4 },
  { slug: 'comparar-ofertas-sin-prisas', titulo: 'Cómo comparar ofertas sin prisas', categoria: 'Consejos', resumen: 'Revisa el coste total y las condiciones antes de decidir.', imagenUrl: '/favicon.svg', fechaPublicacion: '2026-05-18T09:00:00Z', minutosLectura: 5 },
];

export function listArticlesMock(query: ArticleListQuery): Observable<ArticleListResponse> {
  const filtered = articles.filter((article) => !query.categoria || article.categoria === query.categoria);
  const totalPaginas = Math.ceil(filtered.length / 9);
  return mockResponse({
    articulos: filtered.slice((query.pagina - 1) * 9, query.pagina * 9),
    pagina: query.pagina,
    totalArticulos: filtered.length,
    totalPaginas,
  });
}

export function getArticleMock(slug: string): Observable<ArticleResponse> {
  const article = articles.find((item) => item.slug === slug);
  if (!article) return mockError(404, 'No encontramos esta página.');
  const relacionados = articles.filter((item) => item.slug !== slug && item.categoria === article.categoria).slice(0, 3);
  return mockResponse({
    ...article,
    autor: 'Equipo Credara',
    fechaActualizacion: article.fechaPublicacion,
    metaTitulo: `${article.titulo} | Credara`,
    metaDescripcion: article.resumen,
    secciones: [
      { id: 'introduccion', titulo: 'Lo que necesitas saber', contenidoHtml: `<p>${article.resumen}</p><p>Antes de solicitar financiación, compara las condiciones y comprueba que puedes devolver el importe en el plazo acordado.</p>` },
      { id: 'costes', titulo: 'Compara los costes', contenidoHtml: '<p>Revisa los intereses, las comisiones, el total a devolver y la TAE de cada oferta. Las condiciones finales las decide cada entidad.</p>' },
      { id: 'conclusion', titulo: 'Decide con información', contenidoHtml: '<p>Lee el contrato completo y pregunta a la entidad si alguna condición no está clara. Credara compara opciones, pero no concede préstamos.</p>' },
    ],
    relacionados: relacionados.map(({ slug: relatedSlug, titulo, categoria }: ArticleSummaryResponse): { slug: string; titulo: string; categoria: ArticleCategory } => ({ slug: relatedSlug, titulo, categoria })),
  });
}
