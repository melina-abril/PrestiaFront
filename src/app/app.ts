import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppFooter } from './core/layout/app-footer';
import { AppHeader } from './core/layout/app-header';
import { APP_NAVIGATION, APP_TITLE } from './app.navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AppHeader, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly breadcrumb = signal<string | null>(null);
  protected readonly activeSection = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle(APP_TITLE);
    this.updateBreadcrumb();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => this.updateBreadcrumb());
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSection.set(id);
  }

  private updateBreadcrumb(): void {
    const path = this.router.url.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '');
    if (!path) {
      this.breadcrumb.set(null);
      return;
    }
    const item = [...APP_NAVIGATION].filter(entry => path === entry.path || path.startsWith(entry.path + '/')).sort((a, b) => b.path.length - a.path.length)[0];
    this.breadcrumb.set(item?.label ?? 'Página no encontrada');
  }
}
