import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ApiProblemError, errorMessage } from '../../../../core/http/api-error';
import { ErrorAlert } from '../../../../shared/components/error-alert';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
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
  protected readonly activeSection = signal<string | null>(null);
  protected readonly copyMessage = signal('');
  protected readonly articleState = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => this.service.getArticle(slug).pipe(
      map((data): LoadState<ArticleResponse> => ({ status: 'ready', data })),
      startWith({ status: 'loading' } as LoadState<ArticleResponse>),
      catchError((error: unknown) => of<LoadState<ArticleResponse>>({
        status: 'error',
        message: error instanceof ApiProblemError && error.status === 404
          ? 'No encontramos esta página'
          : errorMessage(error),
      })),
    ))),
    { initialValue: { status: 'loading' } as LoadState<ArticleResponse> },
  );

  constructor() {
    effect((onCleanup) => {
      const state = this.articleState();
      if (state.status !== 'ready' || typeof document === 'undefined') return;
      const article = state.data;
      const oldTitle = document.title;
      document.title = article.metaTitulo;
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = article.metaDescripcion;
      document.head.appendChild(meta);
      const structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.titulo,
        author: { '@type': 'Organization', name: article.autor },
        datePublished: article.fechaPublicacion,
        dateModified: article.fechaActualizacion,
        image: article.imagenUrl || undefined,
      }).replace(/</g, '\\u003c');
      document.head.appendChild(structuredData);
      onCleanup(() => {
        document.title = oldTitle;
        meta.remove();
        structuredData.remove();
      });
    });
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copyMessage.set('Enlace copiado');
    } catch {
      this.copyMessage.set('No pudimos copiar el enlace.');
    }
  }

  protected shareWhatsApp(title: string): void {
    const text = encodeURIComponent(`${title} ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }
}
