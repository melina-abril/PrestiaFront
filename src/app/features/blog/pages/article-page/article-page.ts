import { DatePipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { BlogService } from '../../data-access/blog.service';
import { ArticleResponse } from '../../models/blog.models';

@Component({
  selector: 'app-article-page',
  imports: [DatePipe, RouterLink, ErrorAlert, LoadingState],
  templateUrl: './article-page.html',
  styleUrl: './article-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePage implements OnDestroy {
  readonly slug = input.required<string>();

  private readonly blog = inject(BlogService);
  private readonly document = inject(DOCUMENT);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));
  private readonly initialTitle = this.document.title;
  private readonly description = this.document.querySelector('meta[name="description"]');
  private readonly initialDescription = this.description?.getAttribute('content') ?? null;
  private structuredData: HTMLScriptElement | null = null;

  protected readonly activeSection = signal<string | null>(null);
  protected readonly copied = signal(false);
  protected readonly notFound = signal(false);
  protected readonly articleState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => {
        this.notFound.set(false);
        this.copied.set(false);
        this.activeSection.set(null);
        this.clearStructuredData();
        return toLoadState(this.blog.getArticle(slug)).pipe(
          tap((state) => {
            if (state.status === 'ready') this.setMetadata(state.data);
          }),
          catchError((error: unknown) => {
            this.notFound.set(error instanceof ApiProblemError && error.status === 404);
            return of<LoadState<ArticleResponse>>({ status: 'error', message: errorMessage(error) });
          }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as LoadState<ArticleResponse> },
  );

  protected retry(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected async copyLink(): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(this.document.location.href);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }

  protected shareOnWhatsApp(title: string): void {
    const text = encodeURIComponent(`${title} ${this.document.location.href}`);
    this.document.defaultView?.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  ngOnDestroy(): void {
    this.clearStructuredData();
    this.document.title = this.initialTitle;
    if (this.initialDescription === null) this.description?.removeAttribute('content');
    else this.description?.setAttribute('content', this.initialDescription);
  }

  private setMetadata(article: ArticleResponse): void {
    this.document.title = article.metaTitle;
    this.description?.setAttribute('content', article.metaDescription);
    this.clearStructuredData();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, author: { '@type': 'Organization', name: article.author }, datePublished: article.publishedAt, dateModified: article.updatedAt, image: article.imageUrl });
    this.document.head.appendChild(script);
    this.structuredData = script;
  }

  private clearStructuredData(): void {
    this.structuredData?.remove();
    this.structuredData = null;
  }
}
