import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../../core/http/api-url';
import { ArticleListQuery, ArticlePageResponse, ArticleResponse } from '../models/blog.models';
import { getArticleMock, listArticlesMock } from './blog.mock';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);

  listArticles(query: ArticleListQuery): Observable<ArticlePageResponse> {
    if (environment.useMock) return listArticlesMock(query);
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.category) params = params.set('category', query.category);
    return this.http.get<ArticlePageResponse>(apiUrl('/api/articles'), { params });
  }

  getArticle(slug: string): Observable<ArticleResponse> {
    if (environment.useMock) return getArticleMock(slug);
    return this.http.get<ArticleResponse>(apiUrl(`/api/articles/${encodeURIComponent(slug)}`));
  }
}
