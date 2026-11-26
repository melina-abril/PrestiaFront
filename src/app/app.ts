import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_NAVIGATION, APP_TITLE } from './app.navigation';
import { AppFooter } from './core/layout/app-footer';
import { AppHeader } from './core/layout/app-header';

interface Breadcrumb {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AppHeader, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly breadcrumbs = signal<readonly Breadcrumb[]>([]);
  protected readonly activeSection = signal<string | null>(null);

  constructor() {
    inject(Title).setTitle(APP_TITLE);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => this.updateBreadcrumbs(event.urlAfterRedirects));
    this.updateBreadcrumbs(this.router.url);
    this.destroyRef.onDestroy(() => this.document.getElementById('credara-breadcrumb-data')?.remove());
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private updateBreadcrumbs(url: string): void {
    const path = url.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '');
    const home = APP_NAVIGATION[0];
    if (!path || path === home?.path) {
      this.breadcrumbs.set([]);
      this.document.getElementById('credara-breadcrumb-data')?.remove();
      return;
    }

    const segments = path.split('/');
    const crumbs: Breadcrumb[] = home ? [{ label: 'Inicio', path: home.path }] : [];
    for (let index = 0; index < segments.length; index += 1) {
      const partial = segments.slice(0, index + 1).join('/');
      const item = APP_NAVIGATION.find(entry => entry.path === partial);
      const label = item?.label ?? decodeURIComponent(segments[index]).replace(/-/g, ' ');
      crumbs.push(index === segments.length - 1 ? { label } : { label, ...(item ? { path: item.path } : {}) });
    }
    this.breadcrumbs.set(crumbs);
    this.document.getElementById('credara-breadcrumb-data')?.remove();
    const script = this.document.createElement('script');
    script.id = 'credara-breadcrumb-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: new URL('/' + (crumb.path ?? path), this.document.baseURI).href,
      })),
    });
    this.document.head.appendChild(script);
  }
}
