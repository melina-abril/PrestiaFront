import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { categoryOptions } from '../../data-access/blog.mock';
import { BlogService } from '../../data-access/blog.service';
import { ArticleCategory, ArticleListQuery, ArticleListResponse, isArticleCategory } from '../../models/blog.models';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink, DatePipe, LoadingState, EmptyState, ErrorAlert],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly service = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reloadCount = signal(0);
  protected readonly categories = categoryOptions();

  protected readonly query = toSignal(this.route.queryParamMap.pipe(map((params): ArticleListQuery => {
    const rawPage = params.get('pagina');
    const parsedPage = rawPage === null || !/^[1-9]\d*$/.test(rawPage) ? 1 : Number(rawPage);
    const category = params.get('categoria');
    return {
      categoria: isArticleCategory(category) ? category : undefined,
      pagina: Number.isSafeInteger(parsedPage) ? parsedPage : 1,
    };
  })), { initialValue: { pagina: 1 } as ArticleListQuery });

  private readonly request = computed(() => ({ query: this.query(), reload: this.reloadCount() }));
  protected readonly articlesState = toSignal(
    toObservable(this.request).pipe(switchMap(({ query }) => toLoadState(this.service.listArticles(query)))),
    { initialValue: { status: 'loading' } as LoadState<ArticleListResponse> },
  );

  protected selectCategory(category: ArticleCategory | 'Todas'): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: category === 'Todas' ? null : category, pagina: null },
    });
  }

  protected goToPage(page: number): void {
    if (page < 1 || !Number.isSafeInteger(page)) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: this.query().categoria ?? null, pagina: page === 1 ? null : page },
    });
  }

  protected pageNumbers(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  protected retry(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
