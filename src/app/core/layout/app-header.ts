import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { APP_FOOTER_PATHS, APP_NAV_GROUPS, APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import type { NavigationItem } from './navigation.model';

interface MenuGroup {
  label: string;
  items: readonly NavigationItem[];
}

interface Breadcrumb {
  label: string;
  path: string | null;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="site-header__bar">
        @if (home(); as start) {
          <a class="brand" [routerLink]="'/' + start.path" [attr.aria-label]="title + ', ir al inicio'">
            <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 17.5 10 6l3.2 6 2.1-3.5L20 17.5H4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 17.5 13.2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>
            <span>credara<span class="brand__dot">.</span></span>
          </a>
        } @else {
          <span class="brand"><span class="brand__mark" aria-hidden="true">◇</span>{{ title }}</span>
        }

        <nav class="desktop-nav" aria-label="Navegación principal">
          @for (entry of primaryEntries(); track entry.key) {
            @if (entry.group; as group) {
              <div class="nav-group" (mouseenter)="openDesktop.set(entry.key)" (mouseleave)="openDesktop.set(null)">
                <button class="nav-link" type="button" [class.nav-link--active]="groupActive(group)" [attr.aria-expanded]="openDesktop() === entry.key" (click)="toggleDesktop(entry.key)" (keydown.arrowdown)="openAndFocus(entry.key, $event)" (keydown.arrowup)="openAndFocus(entry.key, $event)">
                  {{ group.label }} <span aria-hidden="true">⌄</span>
                </button>
                @if (openDesktop() === entry.key) {
                  <div class="nav-panel" [class.nav-panel--wide]="group.items.length > 5">
                    @if (group.items.length > 5) {
                      <div class="nav-panel__heading"><span>Encuentra lo que necesitas</span><strong>Préstamos para cada momento</strong></div>
                    }
                    <div class="nav-panel__items">
                      @for (item of group.items; track item.path; let index = $index) {
                        <a class="nav-panel__item" [routerLink]="'/' + item.path" (click)="openDesktop.set(null)"><span class="nav-panel__number">{{ index + 1 }}</span>{{ item.label }}</a>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else if (entry.item; as item) {
              <a class="nav-link" [routerLink]="'/' + item.path" routerLinkActive="nav-link--active" (click)="openDesktop.set(null)">{{ item.label }}</a>
            }
          }
          @if (moreEntries().length) {
            <div class="nav-group" (mouseenter)="openDesktop.set('more')" (mouseleave)="openDesktop.set(null)">
              <button class="nav-link" type="button" [attr.aria-expanded]="openDesktop() === 'more'" (click)="toggleDesktop('more')">Más <span aria-hidden="true">⌄</span></button>
              @if (openDesktop() === 'more') {
                <div class="nav-panel nav-panel--more">
                  @for (entry of moreEntries(); track entry.key) {
                    @if (entry.group; as group) {
                      <span class="nav-panel__heading"><strong>{{ group.label }}</strong></span>
                      @for (item of group.items; track item.path) {
                        <a class="nav-panel__item" [routerLink]="'/' + item.path" (click)="openDesktop.set(null)">{{ item.label }}</a>
                      }
                    } @else if (entry.item; as item) {
                      <a class="nav-panel__item" [routerLink]="'/' + item.path" (click)="openDesktop.set(null)">{{ item.label }}</a>
                    }
                  }
                </div>
              }
            </div>
          }
        </nav>

        <div class="header-actions">
          <span class="security-seal" aria-label="100% seguro"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2 17 5v5c0 4.3-2.7 6.8-7 8-4.3-1.2-7-3.7-7-8V5l7-3Z" stroke="currentColor" stroke-width="1.7"/><path d="m7 10 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>100% seguro</span>
          @if (home(); as start) {
            <a class="request-link" [routerLink]="'/' + start.path" fragment="calculadora">Solicitar préstamo <span aria-hidden="true">→</span></a>
          }
          <button class="mobile-toggle" type="button" [attr.aria-label]="mobileOpen() ? 'Cerrar menú' : 'Abrir menú'" [attr.aria-expanded]="mobileOpen()" aria-controls="mobile-navigation" (click)="toggleMobile()">{{ mobileOpen() ? '✕' : '☰' }}</button>
        </div>
      </div>

      @if (mobileOpen()) {
        <nav id="mobile-navigation" class="mobile-nav" aria-label="Navegación móvil">
          @for (entry of entries(); track entry.key) {
            @if (entry.group; as group) {
              <div class="mobile-group">
                <button type="button" [attr.aria-expanded]="mobileGroups().has(entry.key)" (click)="toggleMobileGroup(entry.key)">{{ group.label }} <span aria-hidden="true">{{ mobileGroups().has(entry.key) ? '⌄' : '›' }}</span></button>
                @if (mobileGroups().has(entry.key)) {
                  <div class="mobile-group__items">
                    @for (item of group.items; track item.path) {
                      <a [routerLink]="'/' + item.path" routerLinkActive="mobile-link--active" (click)="closeMobile()">{{ item.label }}</a>
                    }
                  </div>
                }
              </div>
            } @else if (entry.item; as item) {
              <a [routerLink]="'/' + item.path" routerLinkActive="mobile-link--active" (click)="closeMobile()">{{ item.label }}</a>
            }
          }
          @if (home(); as start) {
            <a class="mobile-request" [routerLink]="'/' + start.path" fragment="calculadora" (click)="closeMobile()">Solicitar préstamo →</a>
          }
        </nav>
      }
    </header>

    @if (breadcrumbs().length > 1) {
      <nav class="breadcrumbs" aria-label="Migas de pan">
        <ol>
          @for (crumb of breadcrumbs(); track $index; let last = $last) {
            <li>
              @if (last || crumb.path === null) {
                <span aria-current="page">{{ crumb.label }}</span>
              } @else {
                <a [routerLink]="'/' + crumb.path">{{ crumb.label }}</a>
                <span class="breadcrumbs__separator" aria-hidden="true">›</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: `
    :host { display: block; position: relative; z-index: 50; }
    .site-header { position: sticky; top: 0; z-index: 50; padding: var(--space-4) var(--gutter); background: var(--gradient-hero); }
    .site-header__bar { display: flex; align-items: center; gap: var(--space-4); width: 100%; padding: 10px 12px 10px 20px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--glass-bg); backdrop-filter: var(--glass-blur); box-shadow: var(--shadow-md); }
    .brand { display: inline-flex; flex-shrink: 0; align-items: center; gap: 10px; color: var(--text-primary); font: 800 1.375rem var(--font-display); letter-spacing: var(--tracking-tight); white-space: nowrap; }
    .brand__mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--gradient-brand); color: var(--on-primary); box-shadow: var(--shadow-brand); }
    .brand__mark svg { width: 23px; height: 23px; }
    .brand__dot { color: var(--accent); }
    .desktop-nav { display: flex; flex: 1 1 auto; align-items: center; justify-content: flex-end; gap: var(--space-1); min-width: 0; }
    .nav-group { position: relative; min-width: 0; }
    .nav-link { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; padding: 9px 12px; overflow: hidden; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-primary); font: 600 var(--fs-small) var(--font-body); text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
    .nav-link:hover, .nav-link--active { background: var(--active-item); color: var(--primary); font-weight: 700; }
    .nav-panel { position: absolute; top: 100%; left: 0; z-index: 60; width: max-content; min-width: 230px; max-width: min(90vw, 840px); padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .nav-panel--wide { width: min(840px, 90vw); }
    .nav-panel--more { left: auto; right: 0; }
    .nav-panel__heading { display: grid; margin-bottom: var(--space-4); color: var(--primary); font-size: var(--fs-eyebrow); font-weight: 700; }
    .nav-panel__heading strong { color: var(--text-primary); font: 800 var(--fs-h3) var(--font-display); }
    .nav-panel__items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
    .nav-panel__item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: var(--fs-small); font-weight: 600; }
    .nav-panel__item:hover, .nav-panel__item:focus-visible { background: var(--soft-background); color: var(--primary); }
    .nav-panel__number { display: grid; flex-shrink: 0; place-items: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--soft-background); color: var(--primary); }
    .header-actions { display: flex; flex-shrink: 0; align-items: center; gap: var(--space-3); }
    .security-seal { display: inline-flex; align-items: center; gap: 6px; color: var(--success); font-size: .75rem; font-weight: 700; white-space: nowrap; }
    .security-seal svg { width: 17px; height: 17px; }
    .request-link, .mobile-request { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); min-height: 44px; padding: 0 18px; border-radius: var(--radius-pill); background: var(--primary); color: var(--on-primary); box-shadow: var(--shadow-brand); font-size: var(--fs-small); font-weight: 700; white-space: nowrap; }
    .request-link:hover, .mobile-request:hover { background: var(--primary-600); color: var(--on-primary); }
    .mobile-toggle, .mobile-nav { display: none; }
    .breadcrumbs { padding: var(--space-3) var(--gutter); color: var(--text-secondary); font-size: var(--fs-small); }
    .breadcrumbs ol { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
    .breadcrumbs a { color: var(--primary); }
    .breadcrumbs__separator { margin-left: var(--space-2); }
    @media (max-width: 1100px) {
      .desktop-nav, .security-seal, .request-link { display: none; }
      .site-header__bar { justify-content: space-between; }
      .mobile-toggle { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface); color: var(--text-primary); font-size: 1.4rem; cursor: pointer; }
      .mobile-nav { display: grid; gap: var(--space-1); width: 100%; max-height: calc(100dvh - 100px); margin-top: var(--space-2); padding: var(--space-4); overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); box-shadow: var(--shadow-lg); }
      .mobile-nav a, .mobile-group button { display: block; width: 100%; padding: var(--space-3); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-primary); text-align: left; font: 600 var(--fs-small) var(--font-body); cursor: pointer; }
      .mobile-nav a:hover, .mobile-group button:hover, .mobile-link--active { background: var(--soft-background); color: var(--primary); }
      .mobile-group button span { float: right; }
      .mobile-group__items { padding-left: var(--space-5); }
      .mobile-nav .mobile-request { display: flex; margin-top: var(--space-2); background: var(--primary); color: var(--on-primary); text-align: center; }
    }
  `,
})
export class AppHeader {
  protected readonly title = APP_TITLE;
  protected readonly home = signal(APP_NAVIGATION[0] ?? null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileGroups = signal<ReadonlySet<string>>(new Set<string>());
  protected readonly openDesktop = signal<string | null>(null);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal(this.router.url);
  private readonly structuredData: HTMLScriptElement;

  protected readonly entries = computed(() => {
    const groups: MenuGroup[] = APP_NAV_GROUPS.map(group => ({
      label: group.label,
      items: APP_NAVIGATION.filter(item => group.paths.includes(item.path) && !APP_FOOTER_PATHS.includes(item.path)),
    })).filter(group => group.items.length > 0);
    const grouped = new Set(groups.flatMap(group => group.items.map(item => item.path)));
    const result: { key: string; group?: MenuGroup; item?: NavigationItem }[] = [];
    for (const item of APP_NAVIGATION.slice(1)) {
      if (APP_FOOTER_PATHS.includes(item.path)) continue;
      const group = groups.find(candidate => candidate.items.some(member => member.path === item.path));
      if (group) {
        const key = 'group:' + group.label;
        if (!result.some(entry => entry.key === key)) result.push({ key, group });
      } else if (!grouped.has(item.path)) {
        result.push({ key: item.path, item });
      }
    }
    return result;
  });
  protected readonly primaryEntries = computed(() => this.entries().length > 5 ? this.entries().slice(0, 4) : this.entries());
  protected readonly moreEntries = computed(() => this.entries().length > 5 ? this.entries().slice(4) : []);
  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const path = this.currentUrl().split(/[?#]/, 1)[0].replace(/^\//, '').replace(/\/$/, '');
    const start = this.home();
    if (!start || !path || path === start.path) return [];
    const crumbs: Breadcrumb[] = [{ label: 'Inicio', path: start.path }];
    const matches = APP_NAVIGATION.filter(item => path === item.path || path.startsWith(item.path + '/'));
    const parent = matches.sort((a, b) => b.path.length - a.path.length)[0];
    if (parent) crumbs.push({ label: parent.label, path: path === parent.path ? null : parent.path });
    if (!parent || path !== parent.path) {
      const segment = path.split('/').at(-1) ?? path;
      crumbs.push({ label: decodeURIComponent(segment).replace(/-/g, ' '), path: null });
    }
    return crumbs;
  });

  constructor() {
    this.structuredData = this.document.createElement('script');
    this.structuredData.type = 'application/ld+json';
    this.document.head.appendChild(this.structuredData);
    this.updateBreadcrumbData();
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.closeMobile();
        this.openDesktop.set(null);
        this.updateBreadcrumbData();
      }
    });
    this.destroyRef.onDestroy(() => {
      this.document.body.style.overflow = '';
      this.structuredData.remove();
    });
  }

  protected groupActive(group: MenuGroup): boolean {
    const path = this.currentUrl().split(/[?#]/, 1)[0];
    return group.items.some(item => path === '/' + item.path || path.startsWith('/' + item.path + '/'));
  }

  protected toggleDesktop(key: string): void {
    this.openDesktop.update(value => value === key ? null : key);
  }

  protected openAndFocus(key: string, event: Event): void {
    event.preventDefault();
    this.openDesktop.set(key);
    this.document.defaultView?.setTimeout(() => {
      (event.currentTarget as HTMLElement | null)?.parentElement?.querySelector<HTMLAnchorElement>('.nav-panel a')?.focus();
    });
  }

  protected toggleMobile(): void {
    this.mobileOpen() ? this.closeMobile() : this.showMobile();
  }

  protected toggleMobileGroup(key: string): void {
    const next = new Set(this.mobileGroups());
    next.has(key) ? next.delete(key) : next.add(key);
    this.mobileGroups.set(next);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
    this.mobileGroups.set(new Set<string>());
    this.document.body.style.overflow = '';
  }

  private showMobile(): void {
    this.mobileOpen.set(true);
    this.document.body.style.overflow = 'hidden';
  }

  private updateBreadcrumbData(): void {
    const crumbs = this.breadcrumbs();
    this.structuredData.textContent = crumbs.length < 2 ? '' : JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: new URL(crumb.path === null ? this.router.url : '/' + crumb.path, this.document.baseURI).href,
      })),
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openDesktop.set(null);
    this.closeMobile();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if ((this.document.defaultView?.innerWidth ?? 0) >= 1100) this.closeMobile();
  }
}
