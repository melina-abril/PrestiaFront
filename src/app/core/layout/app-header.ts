import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

type Crumb = { label: string; path: string | null };

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="site-header__bar">
        <a class="brand" [routerLink]="homePath" [attr.aria-label]="title + ', ir al inicio'">
          <span class="brand__mark" aria-hidden="true"><svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 17.5 10 6l3.2 6 2.1-3.5L20 17.5H4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 17.5 13.2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>
          <span>credara<span class="brand__dot">.</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Navegación principal">
          @if (loanItems.length) {
            <div class="nav-group" (mouseenter)="openGroup.set('loans')" (mouseleave)="openGroup.set(null)">
              <button type="button" class="nav-link" [class.nav-link--active]="loanActive()" [attr.aria-expanded]="openGroup() === 'loans'" aria-controls="loan-menu" (click)="toggleGroup('loans')">Préstamos <span aria-hidden="true">⌄</span></button>
              @if (openGroup() === 'loans') {
                <div id="loan-menu" class="dropdown dropdown--loans">
                  <div class="dropdown__heading"><div><span class="dropdown__eyebrow">Encuentra lo que necesitas</span><strong>Préstamos para cada momento</strong></div></div>
                  <div class="dropdown__grid">
                    @for (item of loanItems; track item.path; let index = $index) {
                      <a class="dropdown__item" [routerLink]="'/' + item.path" (click)="closeMenus()"><span class="dropdown__number">{{ index + 1 }}</span>{{ item.label }}</a>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @for (item of directItems; track item.path) {
            <a class="nav-link" [routerLink]="'/' + item.path" routerLinkActive="nav-link--active" [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page">{{ item.label }}</a>
          }
          @if (toolItems.length) {
            <div class="nav-group" (mouseenter)="openGroup.set('tools')" (mouseleave)="openGroup.set(null)">
              <button type="button" class="nav-link" [class.nav-link--active]="toolActive()" [attr.aria-expanded]="openGroup() === 'tools'" aria-controls="tool-menu" (click)="toggleGroup('tools')">Herramientas <span aria-hidden="true">⌄</span></button>
              @if (openGroup() === 'tools') {
                <div id="tool-menu" class="dropdown dropdown--tools">
                  @for (item of toolItems; track item.path) {
                    <a class="dropdown__item" [routerLink]="'/' + item.path" (click)="closeMenus()">{{ item.label }}</a>
                  }
                </div>
              }
            </div>
          }
        </nav>
        <div class="header-actions">
          <span class="security"><span aria-hidden="true">♢</span> 100% seguro</span>
          @if (requestPath) {
            <a class="request-link" [routerLink]="requestPath">Solicitar préstamo <span aria-hidden="true">→</span></a>
          }
          <button class="menu-toggle" type="button" [attr.aria-label]="mobileOpen() ? 'Cerrar menú' : 'Abrir menú'" [attr.aria-expanded]="mobileOpen()" aria-controls="mobile-navigation" (click)="toggleMobile()">{{ mobileOpen() ? '✕' : '☰' }}</button>
        </div>
      </div>
      @if (mobileOpen()) {
        <nav id="mobile-navigation" class="mobile-nav" aria-label="Navegación móvil">
          @if (loanItems.length) {
            <button type="button" class="mobile-nav__link" [attr.aria-expanded]="mobileLoansOpen()" (click)="mobileLoansOpen.set(!mobileLoansOpen())">Préstamos {{ mobileLoansOpen() ? '▾' : '▸' }}</button>
            @if (mobileLoansOpen()) {
              @for (item of loanItems; track item.path) {
                <a class="mobile-nav__link mobile-nav__link--nested" [routerLink]="'/' + item.path" (click)="closeMenus()">{{ item.label }}</a>
              }
            }
          }
          @for (item of directItems; track item.path) {
            <a class="mobile-nav__link" [routerLink]="'/' + item.path" routerLinkActive="mobile-nav__link--active" (click)="closeMenus()">{{ item.label }}</a>
          }
          @if (toolItems.length) {
            <button type="button" class="mobile-nav__link" [attr.aria-expanded]="mobileToolsOpen()" (click)="mobileToolsOpen.set(!mobileToolsOpen())">Herramientas {{ mobileToolsOpen() ? '▾' : '▸' }}</button>
            @if (mobileToolsOpen()) {
              @for (item of toolItems; track item.path) {
                <a class="mobile-nav__link mobile-nav__link--nested" [routerLink]="'/' + item.path" (click)="closeMenus()">{{ item.label }}</a>
              }
            }
          }
          @if (requestPath) {
            <a class="mobile-nav__request" [routerLink]="requestPath" (click)="closeMenus()">Solicitar préstamo →</a>
          }
        </nav>
      }
    </header>
    @if (breadcrumbs(); as crumbs) {
      @if (crumbs.length > 0) {
        <nav class="breadcrumbs" aria-label="Migas de pan">
          <ol>
            @for (crumb of crumbs; track $index) {
              <li>
                @if (crumb.path !== null) {
                  <a [routerLink]="crumb.path">{{ crumb.label }}</a>
                } @else {
                  <span aria-current="page">{{ crumb.label }}</span>
                }
              </li>
            }
          </ol>
        </nav>
      }
    }
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 50; padding: 16px 24px 0; background: var(--background); }
    .site-header { position: relative; width: 100%; }
    .site-header__bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 12px 10px 20px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--glass-bg); backdrop-filter: var(--glass-blur); box-shadow: var(--shadow-md); }
    .brand { display: inline-flex; align-items: center; flex-shrink: 0; gap: 10px; color: var(--text-primary); font: 800 1.375rem var(--font-display); letter-spacing: -.03em; text-decoration: none; }
    .brand__mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--gradient-brand); color: var(--on-primary); box-shadow: var(--shadow-brand); }
    .brand__dot { color: var(--accent); }
    .desktop-nav { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 3px; min-width: 0; }
    .nav-group { position: relative; }
    .nav-link { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-primary); font: 600 .875rem var(--font-body); text-decoration: none; cursor: pointer; white-space: nowrap; }
    .nav-link:hover, .nav-link--active, .nav-link:focus-visible { background: var(--active-item); color: var(--primary); }
    .dropdown { position: absolute; top: 100%; left: 0; width: min(720px, 85vw); padding: 24px 28px 28px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .dropdown--tools { width: 280px; padding: 12px; }
    .dropdown__heading { margin-bottom: 16px; font: 800 1.375rem var(--font-display); }
    .dropdown__heading strong { display: block; }
    .dropdown__eyebrow { display: block; margin-bottom: 4px; color: var(--primary); font: 700 .75rem var(--font-body); letter-spacing: .08em; text-transform: uppercase; }
    .dropdown__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .dropdown__item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: .875rem; font-weight: 600; }
    .dropdown__item:hover { background: var(--soft-background); color: var(--primary); }
    .dropdown__number { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: var(--radius-sm); background: var(--soft-background); color: var(--primary); font-size: .75rem; }
    .header-actions { display: flex; align-items: center; flex-shrink: 0; gap: 12px; }
    .security { color: var(--success); font-size: .75rem; font-weight: 700; white-space: nowrap; }
    .request-link, .mobile-nav__request { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: var(--radius-pill); background: var(--primary); color: var(--on-primary); box-shadow: var(--shadow-brand); font-size: .8125rem; font-weight: 700; white-space: nowrap; }
    .request-link:hover, .mobile-nav__request:hover { background: var(--primary-600); color: var(--on-primary); }
    .menu-toggle { display: none; place-items: center; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface); color: var(--text-primary); font-size: 1.4rem; cursor: pointer; }
    .mobile-nav { display: none; }
    .breadcrumbs { padding: 12px 8px; color: var(--text-secondary); font-size: .8125rem; }
    .breadcrumbs ol { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .breadcrumbs li + li::before { content: '›'; margin-right: 8px; }
    @media (max-width: 899px) {
      :host { padding: 12px 16px 0; }
      .desktop-nav, .security, .request-link { display: none; }
      .menu-toggle { display: grid; }
      .mobile-nav { position: absolute; top: calc(100% + 8px); right: 0; left: 0; display: grid; max-height: calc(100dvh - 100px); overflow-y: auto; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); box-shadow: var(--shadow-lg); }
      .mobile-nav__link { display: block; width: 100%; padding: 11px 12px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-primary); text-align: left; font: 600 .9375rem var(--font-body); cursor: pointer; }
      .mobile-nav__link:hover, .mobile-nav__link--active { background: var(--active-item); color: var(--primary); }
      .mobile-nav__link--nested { padding-left: 32px; }
      .mobile-nav__request { margin-top: 8px; }
    }
  `,
})
export class AppHeader {
  protected readonly title = APP_TITLE;
  protected readonly items: readonly NavigationItem[] = APP_NAVIGATION;
  protected readonly homePath = this.items.length ? '/' + this.items[0].path : '/';
  protected readonly loanItems = this.items.filter(item => this.isLoan(item));
  protected readonly toolItems = this.items.filter(item => this.isTool(item));
  protected readonly directItems = this.items.filter(item => !this.isLoan(item) && !this.isTool(item));
  protected readonly requestPath = this.items.find(item => /solicit|ofertas/i.test(item.label + ' ' + item.path))?.path
    ? '/' + this.items.find(item => /solicit|ofertas/i.test(item.label + ' ' + item.path))?.path
    : this.items.length ? this.homePath : null;
  protected readonly openGroup = signal<'loans' | 'tools' | null>(null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileLoansOpen = signal(false);
  protected readonly mobileToolsOpen = signal(false);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly currentPath = signal(this.router.url.split(/[?#]/)[0]);
  protected readonly loanActive = computed(() => this.loanItems.some(item => this.matches(item)));
  protected readonly toolActive = computed(() => this.toolItems.some(item => this.matches(item)));
  protected readonly breadcrumbs = computed<readonly Crumb[]>(() => {
    const path = this.currentPath();
    if (!this.items.length || path === this.homePath || path === '/') return [];
    const matches = this.items.filter(item => path === '/' + item.path || path.startsWith('/' + item.path + '/'));
    const parent = matches.sort((a, b) => a.path.length - b.path.length);
    const last = parent[parent.length - 1];
    const label = last && path === '/' + last.path ? last.label : decodeURIComponent(path.split('/').filter(Boolean).at(-1) ?? 'Página');
    const crumbs: Crumb[] = [{ label: 'Inicio', path: this.homePath }];
    for (const item of parent) {
      if (item.path !== last?.path || path !== '/' + item.path) crumbs.push({ label: item.label, path: '/' + item.path });
    }
    crumbs.push({ label, path: null });
    return crumbs;
  });

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed()).subscribe(event => {
      this.currentPath.set(event.urlAfterRedirects.split(/[?#]/)[0]);
      this.closeMenus();
      this.updateBreadcrumbData();
    });
    this.updateBreadcrumbData();
  }

  private isLoan(item: NavigationItem): boolean {
    return /pr[eé]stam|prestamos/i.test(item.label + ' ' + item.path);
  }

  private isTool(item: NavigationItem): boolean {
    return /simulador|calculadora|\btest\b|herramientas/i.test(item.label + ' ' + item.path);
  }

  private matches(item: NavigationItem): boolean {
    const path = this.currentPath();
    return path === '/' + item.path || path.startsWith('/' + item.path + '/');
  }

  protected toggleGroup(group: 'loans' | 'tools'): void {
    this.openGroup.update(current => current === group ? null : group);
  }

  protected toggleMobile(): void {
    this.mobileOpen.update(open => !open);
    this.document.body.style.overflow = this.mobileOpen() ? 'hidden' : '';
  }

  protected closeMenus(): void {
    this.openGroup.set(null);
    this.mobileOpen.set(false);
    this.mobileLoansOpen.set(false);
    this.mobileToolsOpen.set(false);
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenus();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.document.defaultView && this.document.defaultView.innerWidth >= 900) this.closeMenus();
  }

  private updateBreadcrumbData(): void {
    const existing = this.document.getElementById('credara-breadcrumb-data');
    existing?.remove();
    const crumbs = this.breadcrumbs();
    if (!crumbs.length || !this.document.defaultView) return;
    const script = this.document.createElement('script');
    script.id = 'credara-breadcrumb-data';
    script.type = 'application/ld+json';
    const base = this.document.defaultView.location.origin;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: base + (crumb.path ?? this.currentPath()),
      })),
    });
    this.document.head.appendChild(script);
  }
}
