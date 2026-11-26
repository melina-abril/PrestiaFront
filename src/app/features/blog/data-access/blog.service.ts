import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { ArticleListQuery, ArticleListResponse, ArticleResponse } from '../models/blog.models';
import { getArticleMock, listArticlesMock } from './blog.mock';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);

  listArticles(query: ArticleListQuery): Observable<ArticleListResponse> {
    if (environment.useMock) return listArticlesMock(query);
    let params = new HttpParams().set('pagina', query.pagina);
    if (query.categoria) params = params.set('categoria', query.categoria);
    return this.http.get<ArticleListResponse>(apiUrl('/api/articulos'), { params });
  }

  getArticle(slug: string): Observable<ArticleResponse> {
    if (environment.useMock) return getArticleMock(slug);
    return this.http.get<ArticleResponse>(apiUrl(`/api/articulos/${encodeURIComponent(slug)}`));
  }
}
