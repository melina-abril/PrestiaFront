export const ARTICLE_CATEGORIES = ['Préstamos', 'Seguridad', 'ASNEF', 'Educación financiera', 'Consejos', 'Legal'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleSummaryResponse {
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  readingMinutes: number;
}

export interface RelatedArticleResponse {
  slug: string;
  title: string;
  category: ArticleCategory;
}

export interface ArticleSectionResponse {
  id: string;
  title: string;
  contentHtml: string;
}

export interface ArticleResponse extends ArticleSummaryResponse {
  author: string;
  updatedAt: string;
  sections: ArticleSectionResponse[];
  relatedArticles: RelatedArticleResponse[];
  metaTitle: string;
  metaDescription: string;
}

export interface ArticlePageResponse {
  items: ArticleSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ArticleFilters {
  category?: ArticleCategory;
  page: number;
}

export function isArticleCategory(value: string | null): value is ArticleCategory {
  return ARTICLE_CATEGORIES.some((category) => category === value);
}
