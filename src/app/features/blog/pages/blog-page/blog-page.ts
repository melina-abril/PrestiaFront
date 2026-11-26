import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { BlogService } from '../../data-access/blog.service';
import { ARTICLE_CATEGORIES, ArticleCategory, ArticleListQuery, ArticleListResponse } from '../../models/blog.models';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink, DatePipe, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BlogService);
  protected readonly categories = ARTICLE_CATEGORIES;
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  private readonly reloadCount = signal(0);
  protected readonly query = computed<ArticleListQuery>(() => {
    const category = this.params().get('categoria');
    const rawPage = this.params().get('pagina');
    const page = rawPage && /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1;
    return {
      categoria: ARTICLE_CATEGORIES.find((item) => item === category),
      pagina: Number.isSafeInteger(page) ? page : 1,
    };
  });
  private readonly request = computed(() => ({ query: this.query(), reload: this.reloadCount() }));
  protected readonly articlesState = toSignal(
    toObservable(this.request).pipe(switchMap(({ query }) => toLoadState(this.service.listArticles(query)))),
    { initialValue: { status: 'loading' } as LoadState<ArticleListResponse> },
  );

  protected pages(total: number): number[] {
    return Array.from({ length: Math.min(total, 100) }, (_, index) => index + 1);
  }

  protected categoryParams(category?: ArticleCategory): { categoria: ArticleCategory | null; pagina: null } {
    return { categoria: category ?? null, pagina: null };
  }

  protected pageParams(page: number): { categoria: ArticleCategory | null; pagina: number } {
    return { categoria: this.query().categoria ?? null, pagina: page };
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
