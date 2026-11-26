import { DatePipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { BlogService } from '../../data-access/blog.service';
import { ArticleResponse } from '../../models/blog.models';

type ArticleLoadState = LoadState<ArticleResponse> | { status: 'not-found' };

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, DatePipe, ErrorAlert, LoadingState],
  templateUrl: './article-page.html',
  styleUrl: './article-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePage {
  readonly slug = input.required<string>();
  private readonly service = inject(BlogService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));
  protected readonly activeSection = signal<string | null>(null);
  protected readonly copied = signal(false);
  protected readonly copyError = signal(false);
  protected readonly articleState = toSignal(
    toObservable(this.request).pipe(switchMap(({ slug }) => this.service.getArticle(slug).pipe(
      map((data): ArticleLoadState => ({ status: 'ready', data })),
      catchError((error: unknown) => of<ArticleLoadState>(error instanceof ApiProblemError && error.status === 404
        ? { status: 'not-found' }
        : { status: 'error', message: 'No pudimos cargar el artículo.' })),
      startWith<ArticleLoadState>({ status: 'loading' }),
    ))),
    { initialValue: { status: 'loading' } as ArticleLoadState },
  );
  protected readonly whatsappUrl = computed(() => {
    const state = this.articleState();
    if (state.status !== 'ready') return '';
    return `https://wa.me/?text=${encodeURIComponent(`${state.data.titulo} ${this.document.location?.href ?? ''}`)}`;
  });

  constructor() {
    const originalTitle = this.title.getTitle();
    const originalDescription = this.meta.getTag('name="description"')?.content;
    effect((onCleanup) => {
      const state = this.articleState();
      if (state.status !== 'ready') return;
      const article = state.data;
      this.title.setTitle(article.metaTitulo);
      this.meta.updateTag({ name: 'description', content: article.metaDescripcion });
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.titulo,
        author: { '@type': 'Organization', name: article.autor },
        datePublished: article.fechaPublicacion,
        dateModified: article.fechaActualizacion,
        image: article.imagenUrl,
      }).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
      onCleanup(() => script.remove());
    });
    this.destroyRef.onDestroy(() => {
      this.title.setTitle(originalTitle);
      if (originalDescription !== undefined) this.meta.updateTag({ name: 'description', content: originalDescription });
      else this.meta.removeTag('name="description"');
    });
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected async copyLink(): Promise<void> {
    this.copyError.set(false);
    this.copied.set(false);
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(this.document.location?.href ?? '');
      this.copied.set(true);
    } catch {
      this.copyError.set(true);
    }
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
