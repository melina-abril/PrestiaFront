import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { BlogService } from '../../data-access/blog.service';
import { ARTICLE_CATEGORIES, ArticleCategory, ArticlePageResponse, isArticleCategory } from '../../models/blog.models';

@Component({
  selector: 'app-blog-page',
  imports: [DatePipe, RouterLink, EmptyState, ErrorAlert, LoadingState],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blog = inject(BlogService);
  private readonly reloadCount = signal(0);
  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly categories = ARTICLE_CATEGORIES;
  protected readonly category = computed<ArticleCategory | null>(() => {
    const value = this.queryParams().get('categoria');
    return isArticleCategory(value) ? value : null;
  });
  protected readonly page = computed(() => {
    const raw = this.queryParams().get('pagina');
    const value = raw === null ? 1 : Number(raw);
    return /^[1-9][0-9]*$/.test(raw ?? '1') && Number.isSafeInteger(value) ? value : 1;
  });
  private readonly request = computed(() => ({ category: this.category(), page: this.page(), reload: this.reloadCount() }));
  protected readonly articlesState = toSignal(
    toObservable(this.request).pipe(switchMap(({ category, page }) => toLoadState(this.blog.listArticles({ page, size: 9, ...(category ? { category } : {}) })))),
    { initialValue: { status: 'loading' } as LoadState<ArticlePageResponse> },
  );

  protected pages(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  protected changeCategory(category: ArticleCategory | null): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { categoria: category, pagina: null } });
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { categoria: this.category(), pagina: page === 1 ? null : page } });
  }

  protected retry(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
