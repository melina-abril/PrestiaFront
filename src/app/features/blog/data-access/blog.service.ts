import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { ArticleFilters, ArticlePageResponse, ArticleResponse } from '../models/blog.models';
import { getArticleMock, listArticlesMock } from './blog.mock';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);

  listArticles(filters: ArticleFilters): Observable<ArticlePageResponse> {
    if (environment.useMock) return listArticlesMock(filters);
    let params = new HttpParams().set('page', filters.page).set('size', 9);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<ArticlePageResponse>(apiUrl('/api/articles'), { params });
  }

  getArticle(slug: string): Observable<ArticleResponse> {
    if (environment.useMock) return getArticleMock(slug);
    return this.http.get<ArticleResponse>(apiUrl(`/api/articles/${encodeURIComponent(slug)}`));
  }
}
