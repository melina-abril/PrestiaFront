export const ARTICLE_CATEGORIES = ['Préstamos', 'Seguridad', 'ASNEF', 'Educación financiera', 'Consejos', 'Legal'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleSummaryResponse {
  slug: string;
  titulo: string;
  categoria: ArticleCategory;
  resumen: string;
  imagenUrl: string;
  fechaPublicacion: string;
  minutosLectura: number;
}

export interface ArticleListResponse {
  articulos: ArticleSummaryResponse[];
  pagina: number;
  totalArticulos: number;
  totalPaginas: number;
}

export interface ArticleSectionResponse {
  id: string;
  titulo: string;
  contenidoHtml: string;
}

export interface RelatedArticleResponse {
  slug: string;
  titulo: string;
  categoria: ArticleCategory;
}

export interface ArticleResponse extends ArticleSummaryResponse {
  autor: string;
  fechaActualizacion: string;
  secciones: ArticleSectionResponse[];
  relacionados: RelatedArticleResponse[];
  metaTitulo: string;
  metaDescripcion: string;
}

export interface ArticleListQuery {
  categoria?: ArticleCategory;
  pagina: number;
}

export function isArticleCategory(value: string | null): value is ArticleCategory {
  return ARTICLE_CATEGORIES.some((category) => category === value);
}
