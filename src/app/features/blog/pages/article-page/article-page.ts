import { DOCUMENT, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ApiProblemError } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { BlogService } from '../../data-access/blog.service';
import { ArticleResponse } from '../../models/blog.models';

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
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly reloadCount = signal(0);
  private readonly request = computed(() => ({ slug: this.slug(), reload: this.reloadCount() }));
  private structuredData: HTMLScriptElement | null = null;
  protected readonly activeSection = signal<string | null>(null);
  protected readonly shareMessage = signal('');
  protected readonly articleState = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ slug }) => toLoadState(this.service.getArticle(slug))),
      tap((state) => {
        this.structuredData?.remove();
        this.structuredData = null;
        if (state.status === 'ready') this.updateMetadata(state.data);
        else if (state.status === 'error' || state.status === 'empty') this.resetMetadata();
      }),
    ),
    { initialValue: { status: 'loading' } as LoadState<ArticleResponse> },
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.structuredData?.remove();
      this.resetMetadata();
    });
  }

  protected isNotFound(message: string): boolean {
    return message.includes('404');
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.document.location.href);
      this.shareMessage.set('Enlace copiado');
    } catch {
      this.shareMessage.set('No se pudo copiar el enlace.');
    }
  }

  protected whatsappLink(title: string): string {
    return `https://wa.me/?text=${encodeURIComponent(`${title} ${this.document.location.href}`)}`;
  }

  private updateMetadata(article: ArticleResponse): void {
    this.title.setTitle(article.metaTitle);
    this.meta.updateTag({ name: 'description', content: article.metaDescription });
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      author: { '@type': 'Organization', name: article.author },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      ...(article.imageUrl ? { image: article.imageUrl } : {}),
    });
    this.document.head.appendChild(script);
    this.structuredData = script;
  }

  private resetMetadata(): void {
    this.title.setTitle('Blog | Credara');
    this.meta.removeTag("name='description'");
  }
}
