import { Observable } from 'rxjs';
import { mockError, mockResponse } from '../../../core/http/mock-response';
import { ArticleCategory, ArticleListQuery, ArticleListResponse, ArticleResponse, ArticleSummaryResponse } from '../models/blog.models';

const articles: ArticleResponse[] = [
  {
    slug: 'prestamo-rapido-guia', titulo: 'Cómo conseguir un préstamo rápido: guía 2026', categoria: 'Préstamos',
    resumen: 'Qué revisar antes de solicitar financiación y cómo comparar las condiciones.', imagenUrl: '',
    fechaPublicacion: '2026-05-12T09:00:00.000Z', minutosLectura: 8, autor: 'Equipo Credara',
    fechaActualizacion: '2026-05-12T09:00:00.000Z', metaTitulo: 'Cómo conseguir un préstamo rápido | Credara',
    metaDescripcion: 'Una guía para comparar préstamos rápidos y conocer su coste.',
    secciones: [
      { id: 'antes-de-pedirlo', titulo: 'Antes de pedirlo', contenidoHtml: '<p>Calcula cuánto necesitas y comprueba que podrás devolverlo en el plazo elegido.</p>' },
      { id: 'compara-el-coste', titulo: 'Compara el coste', contenidoHtml: '<p>Revisa el importe total, las comisiones y la TAE antes de aceptar una oferta.</p>' },
    ], relacionados: [
      { slug: 'tae-vs-tin', titulo: 'TAE y TIN: en qué se diferencian', categoria: 'Educación financiera' },
    ],
  },
  {
    slug: 'prestamos-online-seguros', titulo: 'Préstamos online seguros: cómo detectar estafas', categoria: 'Seguridad',
    resumen: 'Señales para reconocer una oferta sospechosa y proteger tus datos.', imagenUrl: '',
    fechaPublicacion: '2026-05-08T09:00:00.000Z', minutosLectura: 6, autor: 'Equipo Credara',
    fechaActualizacion: '2026-05-08T09:00:00.000Z', metaTitulo: 'Préstamos online seguros | Credara',
    metaDescripcion: 'Consejos para identificar ofertas de préstamos sospechosas.',
    secciones: [
      { id: 'senales-de-alerta', titulo: 'Señales de alerta', contenidoHtml: '<p>Desconfía de las promesas de aprobación garantizada y de los pagos por adelantado.</p>' },
      { id: 'protege-tus-datos', titulo: 'Protege tus datos', contenidoHtml: '<p>Comprueba quién recibe tus datos y lee la política de privacidad.</p>' },
    ], relacionados: [
      { slug: 'prestamo-rapido-guia', titulo: 'Cómo conseguir un préstamo rápido: guía 2026', categoria: 'Préstamos' },
    ],
  },
  {
    slug: 'salir-de-asnef', titulo: 'Cómo salir de ASNEF paso a paso', categoria: 'ASNEF',
    resumen: 'Conoce cómo consultar tus datos y qué hacer si hay un error.', imagenUrl: '',
    fechaPublicacion: '2026-05-03T09:00:00.000Z', minutosLectura: 10, autor: 'Equipo Credara',
    fechaActualizacion: '2026-05-03T09:00:00.000Z', metaTitulo: 'Cómo salir de ASNEF | Credara',
    metaDescripcion: 'Pasos para consultar y revisar tu inscripción en ASNEF.',
    secciones: [
      { id: 'consulta-tus-datos', titulo: 'Consulta tus datos', contenidoHtml: '<p>Solicita acceso a la información registrada a tu nombre.</p>' },
      { id: 'revisa-la-deuda', titulo: 'Revisa la deuda', contenidoHtml: '<p>Si encuentras un error, solicita su rectificación por los canales oficiales.</p>' },
    ], relacionados: [],
  },
  {
    slug: 'tae-vs-tin', titulo: 'TAE y TIN: en qué se diferencian', categoria: 'Educación financiera',
    resumen: 'Aprende a interpretar los indicadores de coste de un préstamo.', imagenUrl: '',
    fechaPublicacion: '2026-04-28T09:00:00.000Z', minutosLectura: 5, autor: 'Equipo Credara',
    fechaActualizacion: '2026-05-02T09:00:00.000Z', metaTitulo: 'TAE y TIN: diferencias | Credara',
    metaDescripcion: 'Entiende qué significan la TAE y el TIN al comparar préstamos.',
    secciones: [
      { id: 'que-es-el-tin', titulo: 'Qué es el TIN', contenidoHtml: '<p>El TIN expresa el interés nominal aplicado al capital prestado.</p>' },
      { id: 'que-es-la-tae', titulo: 'Qué es la TAE', contenidoHtml: '<p>La TAE permite comparar ofertas teniendo en cuenta el plazo y otros costes aplicables.</p>' },
      { id: 'cual-mirar', titulo: 'Cuál mirar al comparar', contenidoHtml: '<p>Compara el coste total y la TAE, además de revisar todas las condiciones de la oferta.</p>' },
    ], relacionados: [
      { slug: 'prestamo-rapido-guia', titulo: 'Cómo conseguir un préstamo rápido: guía 2026', categoria: 'Préstamos' },
      { slug: 'prestamos-online-seguros', titulo: 'Préstamos online seguros: cómo detectar estafas', categoria: 'Seguridad' },
      { slug: 'salir-de-asnef', titulo: 'Cómo salir de ASNEF paso a paso', categoria: 'ASNEF' },
    ],
  },
  {
    slug: 'alternativas-prestamos-rapidos', titulo: 'Alternativas a los préstamos rápidos', categoria: 'Consejos',
    resumen: 'Opciones que puedes valorar antes de pedir financiación.', imagenUrl: '',
    fechaPublicacion: '2026-04-22T09:00:00.000Z', minutosLectura: 7, autor: 'Equipo Credara',
    fechaActualizacion: '2026-04-22T09:00:00.000Z', metaTitulo: 'Alternativas a los préstamos rápidos | Credara',
    metaDescripcion: 'Conoce otras opciones para afrontar un gasto imprevisto.',
    secciones: [{ id: 'opciones', titulo: 'Opciones que puedes considerar', contenidoHtml: '<p>Revisa tu presupuesto y compara distintas opciones antes de decidir.</p>' }],
    relacionados: [],
  },
  {
    slug: 'derechos-prestamo-online', titulo: 'Tus derechos al pedir un préstamo online', categoria: 'Legal',
    resumen: 'Información básica que debes recibir antes de contratar.', imagenUrl: '',
    fechaPublicacion: '2026-04-15T09:00:00.000Z', minutosLectura: 9, autor: 'Equipo Credara',
    fechaActualizacion: '2026-04-15T09:00:00.000Z', metaTitulo: 'Tus derechos al pedir un préstamo | Credara',
    metaDescripcion: 'Consulta tus derechos al solicitar un préstamo por internet.',
    secciones: [{ id: 'informacion-previa', titulo: 'Información previa', contenidoHtml: '<p>Lee las condiciones y el coste total antes de firmar cualquier contrato.</p>' }],
    relacionados: [],
  },
];

export function listArticlesMock(query: ArticleListQuery): Observable<ArticleListResponse> {
  const filtered = articles.filter((article) => !query.categoria || article.categoria === query.categoria)
    .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion));
  const totalPaginas = Math.ceil(filtered.length / 9);
  const articulos: ArticleSummaryResponse[] = filtered.slice((query.pagina - 1) * 9, query.pagina * 9)
    .map(({ slug, titulo, categoria, resumen, imagenUrl, fechaPublicacion, minutosLectura }) =>
      ({ slug, titulo, categoria, resumen, imagenUrl, fechaPublicacion, minutosLectura }));
  return mockResponse({ articulos, pagina: query.pagina, totalArticulos: filtered.length, totalPaginas });
}

export function getArticleMock(slug: string): Observable<ArticleResponse> {
  const article = articles.find((item) => item.slug === slug);
  return article ? mockResponse(article) : mockError(404, 'No encontramos esta página');
}

export function categoryOptions(): readonly (ArticleCategory | 'Todas')[] {
  return ['Todas', 'Préstamos', 'Seguridad', 'ASNEF', 'Educación financiera', 'Consejos', 'Legal'];
}
