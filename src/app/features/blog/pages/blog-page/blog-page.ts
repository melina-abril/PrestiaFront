import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { BlogService } from '../../data-access/blog.service';
import { ARTICLE_CATEGORIES, ArticleCategory, ArticleFilters, ArticlePageResponse, isArticleCategory } from '../../models/blog.models';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink, DatePipe, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly service = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly categories = ARTICLE_CATEGORIES;
  private readonly query = toSignal(this.route.queryParamMap.pipe(map((params): ArticleFilters => {
    const rawPage = params.get('pagina');
    const page = rawPage && /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1;
    const category = params.get('categoria');
    return { page, ...(isArticleCategory(category) ? { category } : {}) };
  })), { initialValue: { page: 1 } as ArticleFilters });
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ filters: this.query(), reload: this.reloadCount() }));
  protected readonly filters = this.query;
  protected readonly articlesState = toSignal(
    toObservable(this.request).pipe(switchMap(({ filters }) => toLoadState(this.service.listArticles(filters)))),
    { initialValue: { status: 'loading' } as LoadState<ArticlePageResponse> },
  );

  protected chooseCategory(category: ArticleCategory | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: category, pagina: null },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected pageNumbers(count: number): number[] {
    return Array.from({ length: Math.min(count, 100) }, (_, index) => index + 1);
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
