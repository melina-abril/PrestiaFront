import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ArticleFilters, ArticlePageResponse, ArticleResponse, ArticleSummaryResponse } from '../models/blog.models';

const articles: ArticleSummaryResponse[] = [
  { slug: 'que-es-la-tae-de-un-prestamo', title: '¿Qué es la TAE y cómo afecta al coste de tu préstamo?', category: 'Educación financiera', summary: 'Aprende a comparar ofertas por su coste real, más allá del interés anunciado.', imageUrl: '', publishedAt: '2026-05-12T10:00:00Z', readingMinutes: 6 },
  { slug: 'como-comparar-prestamos-personales', title: 'Cómo comparar préstamos personales sin perderte entre cifras', category: 'Préstamos', summary: 'Cuota, plazo, comisiones y TAE: las claves para evaluar cada opción.', imageUrl: '', publishedAt: '2026-05-08T10:00:00Z', readingMinutes: 7 },
  { slug: 'evitar-estafas-prestamos-online', title: 'Préstamos online seguros: 7 señales para evitar estafas', category: 'Seguridad', summary: 'Comprueba quién presta el dinero y detecta las alertas antes de solicitarlo.', imageUrl: '', publishedAt: '2026-05-05T10:00:00Z', readingMinutes: 5 },
  { slug: 'prestamo-con-asnef-que-debes-saber', title: '¿Puedes pedir un préstamo si estás en ASNEF?', category: 'ASNEF', summary: 'Qué implica figurar en el fichero y qué conviene revisar antes de solicitar financiación.', imageUrl: '', publishedAt: '2026-04-29T10:00:00Z', readingMinutes: 6 },
  { slug: 'cuanto-puedes-pagar-cada-mes', title: '¿Cuánto puedes pagar al mes por un préstamo?', category: 'Consejos', summary: 'Calcula una cuota asumible sin dejar de atender tus gastos habituales.', imageUrl: '', publishedAt: '2026-04-22T10:00:00Z', readingMinutes: 4 },
  { slug: 'derecho-de-desistimiento-prestamo', title: 'Derecho de desistimiento: cómo cancelar un préstamo', category: 'Legal', summary: 'Conoce los plazos y los pasos para ejercer este derecho en España.', imageUrl: '', publishedAt: '2026-04-15T10:00:00Z', readingMinutes: 5 },
  { slug: 'prestamo-rapido-o-personal', title: 'Préstamo rápido o personal: diferencias clave', category: 'Préstamos', summary: 'Compara importes, plazos y costes según el tipo de financiación.', imageUrl: '', publishedAt: '2026-04-09T10:00:00Z', readingMinutes: 5 },
  { slug: 'crear-un-fondo-de-emergencia', title: 'Fondo de emergencia: cuánto ahorrar y por dónde empezar', category: 'Educación financiera', summary: 'Una guía práctica para prepararte ante gastos inesperados.', imageUrl: '', publishedAt: '2026-04-02T10:00:00Z', readingMinutes: 6 },
  { slug: 'comisiones-de-un-prestamo', title: 'Comisiones de un préstamo: cuáles revisar antes de firmar', category: 'Consejos', summary: 'Apertura, amortización anticipada y otros gastos que pueden variar el coste.', imageUrl: '', publishedAt: '2026-03-26T10:00:00Z', readingMinutes: 5 },
  { slug: 'leer-el-contrato-antes-de-firmar', title: 'Qué revisar en el contrato antes de firmar', category: 'Legal', summary: 'Identifica el importe total, los plazos y tus derechos antes de aceptar.', imageUrl: '', publishedAt: '2026-03-19T10:00:00Z', readingMinutes: 4 },
];

export function listArticlesMock(filters: ArticleFilters): Observable<ArticlePageResponse> {
  const filtered = articles.filter((article) => !filters.category || article.category === filters.category);
  const size = 9;
  return mockResponse({
    items: filtered.slice((filters.page - 1) * size, filters.page * size),
    page: filters.page,
    size,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
  });
}

export function getArticleMock(slug: string): Observable<ArticleResponse> {
  const article = articles.find((item) => item.slug === slug);
  if (!article) return mockError(404, 'No encontramos esta página.');
  return mockResponse({
    ...article,
    author: 'Equipo Credara',
    updatedAt: article.publishedAt,
    sections: [
      { id: 'introduccion', title: 'Lo que debes saber', contentHtml: `<p>${article.summary}</p>` },
      { id: 'comparar-opciones', title: 'Compara tus opciones', contentHtml: '<p>Revisa el coste total, la TAE y el plazo de devolución. Las condiciones finales las decide cada entidad.</p>' },
      { id: 'antes-de-decidir', title: 'Antes de decidir', contentHtml: '<p>Comprueba que puedes devolver el préstamo a tiempo y lee las condiciones antes de aceptarlo.</p>' },
    ],
    relatedArticles: articles.filter((item) => item.slug !== slug && item.category === article.category).slice(0, 3).map(({ slug: relatedSlug, title, category }) => ({ slug: relatedSlug, title, category })),
    metaTitle: `${article.title} | Credara`,
    metaDescription: article.summary,
  });
}
