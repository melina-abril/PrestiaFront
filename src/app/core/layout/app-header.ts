import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="site-header__inner">
        @if (home; as destination) {
          <a class="logo" [routerLink]="'/' + destination.path" (click)="closeMenu()" aria-label="Credara: ir al inicio"><span class="logo-mark" aria-hidden="true">C</span>{{ brand }}</a>
        } @else {
          <span class="logo"><span class="logo-mark" aria-hidden="true">C</span>{{ brand }}</span>
        }
        <nav class="desktop-nav" aria-label="Navegación principal">
          @if (loans.length) {
            <div class="dropdown" (mouseenter)="desktopPanel.set('loans')" (mouseleave)="desktopPanel.set(null)">
              <button type="button" class="nav-link" [class.is-active]="isSectionActive(loans)" [attr.aria-expanded]="desktopPanel() === 'loans'" (click)="togglePanel('loans')" (keydown)="onPanelKeydown($event, 'loans')">Préstamos <span aria-hidden="true">▾</span></button>
              @if (desktopPanel() === 'loans') {
                <div class="dropdown-panel loans-panel">
                  @for (item of loans; track item.path) {
                    <a [routerLink]="'/' + item.path" (click)="closeMenu()">{{ item.label }}@if (loanHelp(item); as help) { <small>{{ help }}</small> }</a>
                  }
                </div>
              }
            </div>
          }
          @for (item of direct; track item.path) {
            <a class="nav-link" [routerLink]="'/' + item.path" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page" (click)="closeMenu()">{{ item.label }}</a>
          }
          @if (tools.length) {
            <div class="dropdown" (mouseenter)="desktopPanel.set('tools')" (mouseleave)="desktopPanel.set(null)">
              <button type="button" class="nav-link" [class.is-active]="isSectionActive(tools)" [attr.aria-expanded]="desktopPanel() === 'tools'" (click)="togglePanel('tools')" (keydown)="onPanelKeydown($event, 'tools')">Herramientas <span aria-hidden="true">▾</span></button>
              @if (desktopPanel() === 'tools') {
                <div class="dropdown-panel tools-panel">
                  @for (item of tools; track item.path) {
                    <a [routerLink]="'/' + item.path" (click)="closeMenu()">{{ item.label }}</a>
                  }
                </div>
              }
            </div>
          }
        </nav>
        <div class="header-actions">
          <span class="secure">🔒 100% seguro</span>
          @if (home; as destination) {
            <a class="request-button" [routerLink]="'/' + destination.path" fragment="calculadora" (click)="closeMenu()">Solicitar préstamo</a>
          }
        </div>
        <button class="mobile-toggle" type="button" [attr.aria-label]="menuOpen() ? 'Cerrar menú' : 'Abrir menú'" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-navigation" (click)="toggleMenu()">{{ menuOpen() ? '✕' : '☰' }}</button>
      </div>
      @if (menuOpen()) {
        <nav id="mobile-navigation" class="mobile-nav" aria-label="Navegación móvil">
          @if (loans.length) {
            <button type="button" class="mobile-nav__group" [attr.aria-expanded]="loansOpen()" (click)="loansOpen.set(!loansOpen())">Préstamos {{ loansOpen() ? '▴' : '▾' }}</button>
            @if (loansOpen()) {
              @for (item of loans; track item.path) {
                <a class="mobile-nav__sub" [routerLink]="'/' + item.path" (click)="closeMenu()">{{ item.label }}</a>
              }
            }
          }
          @for (item of direct; track item.path) {
            <a [routerLink]="'/' + item.path" routerLinkActive="is-active" (click)="closeMenu()">{{ item.label }}</a>
          }
          @if (tools.length) {
            <button type="button" class="mobile-nav__group" [attr.aria-expanded]="toolsOpen()" (click)="toolsOpen.set(!toolsOpen())">Herramientas {{ toolsOpen() ? '▴' : '▸' }}</button>
            @if (toolsOpen()) {
              @for (item of tools; track item.path) {
                <a class="mobile-nav__sub" [routerLink]="'/' + item.path" (click)="closeMenu()">{{ item.label }}</a>
              }
            }
          }
          @if (home; as destination) {
            <a class="request-button mobile-request" [routerLink]="'/' + destination.path" fragment="calculadora" (click)="closeMenu()">Solicitar préstamo</a>
          }
        </nav>
      }
    </header>
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 20; }
    .site-header { background: var(--surface); border-bottom: 1px solid var(--border); }
    .site-header__inner { width: 100%; display: flex; align-items: center; gap: 1.5rem; padding: 0.85rem var(--space-lg); }
    .logo { display: inline-flex; align-items: center; gap: 0.55rem; flex-shrink: 0; color: var(--text-primary); font-size: 1.25rem; font-weight: 750; text-decoration: none; }
    .logo-mark { display: inline-grid; place-items: center; width: 2rem; height: 2rem; border-radius: 7px; background: var(--primary); color: var(--surface); font-weight: 800; }
    .desktop-nav { display: flex; align-items: center; justify-content: center; flex: 1; gap: 0.25rem; }
    .nav-link { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.65rem; border: 0; border-radius: 7px; background: transparent; color: var(--text-primary); font: inherit; font-size: 0.875rem; text-decoration: none; white-space: nowrap; cursor: pointer; }
    .nav-link:hover, .nav-link:focus-visible, .nav-link.is-active { background: var(--active-item); color: var(--primary); font-weight: 700; }
    .dropdown { position: relative; }
    .dropdown-panel { position: absolute; top: 100%; left: 0; min-width: 14rem; padding: 0.65rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); }
    .loans-panel { display: grid; grid-template-columns: repeat(3, minmax(10rem, 1fr)); width: min(42rem, 85vw); }
    .dropdown-panel a { display: block; padding: 0.6rem; border-radius: 6px; color: var(--text-primary); font-size: 0.875rem; text-decoration: none; }
    .dropdown-panel a:hover, .dropdown-panel a:focus-visible { background: var(--soft-background); color: var(--primary); }
    .dropdown-panel small { display: block; margin-top: 0.2rem; color: var(--text-secondary); }
    .header-actions { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
    .secure { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; }
    .request-button { display: inline-flex; justify-content: center; padding: 0.7rem 0.9rem; border-radius: 7px; background: var(--primary); color: var(--surface); font-size: 0.875rem; font-weight: 700; text-decoration: none; white-space: nowrap; }
    .request-button:hover { background: var(--accent); }
    .mobile-toggle, .mobile-nav { display: none; }
    :host a:focus-visible, :host button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (max-width: 899px) {
      .site-header__inner { padding: 0.7rem var(--space-md); }
      .desktop-nav, .header-actions { display: none; }
      .mobile-toggle { display: inline-flex; align-items: center; justify-content: center; margin-left: auto; border: 0; background: transparent; color: var(--primary); font-size: 1.5rem; cursor: pointer; }
      .mobile-nav { display: flex; flex-direction: column; width: 100%; max-height: calc(100dvh - 3.5rem); overflow-y: auto; padding: 0.5rem var(--space-md) var(--space-md); border-top: 1px solid var(--border); background: var(--surface); }
      .mobile-nav a, .mobile-nav__group { display: block; width: 100%; padding: 0.75rem; border: 0; border-radius: 6px; background: transparent; color: var(--text-primary); font: inherit; font-size: 0.9rem; text-align: left; text-decoration: none; cursor: pointer; }
      .mobile-nav a:hover, .mobile-nav a.is-active, .mobile-nav__group:hover { background: var(--active-item); color: var(--primary); }
      .mobile-nav .mobile-nav__sub { padding-left: 1.75rem; color: var(--text-secondary); }
      .mobile-nav .mobile-request { margin-top: 0.5rem; background: var(--primary); color: var(--surface); text-align: center; }
    }
  `,
})
export class AppHeader implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly navigationSubscription: Subscription;
  protected readonly brand = APP_TITLE.split(' · ')[0];
  protected readonly home: NavigationItem | undefined = APP_NAVIGATION[0];
  protected readonly loans: readonly NavigationItem[] = APP_NAVIGATION.filter(item => /pr[eé]stam|loan/i.test(item.path + ' ' + item.label) && item !== this.home);
  protected readonly tools: readonly NavigationItem[] = APP_NAVIGATION.filter(item => /simulador|calculadora|test|tae|simulator|calculator/i.test(item.path + ' ' + item.label) && item !== this.home && !this.loans.includes(item));
  protected readonly direct: readonly NavigationItem[] = APP_NAVIGATION.filter(item => item !== this.home && !this.loans.includes(item) && !this.tools.includes(item));
  protected readonly menuOpen = signal(false);
  protected readonly loansOpen = signal(false);
  protected readonly toolsOpen = signal(false);
  protected readonly desktopPanel = signal<'loans' | 'tools' | null>(null);

  constructor() {
    this.navigationSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.closeMenu());
  }

  protected loanHelp(item: NavigationItem): string | null {
    const name = item.label.toLowerCase();
    if (name.includes('rápidos')) return 'Dinero en minutos';
    if (name.includes('online')) return 'Todo desde el móvil';
    if (name.includes('nómina')) return 'Otros ingresos';
    if (name.includes('asnef')) return 'Estudian tu caso';
    if (name.includes('urgentes')) return 'Respuesta ≤ 30 min';
    if (name.includes('intereses')) return '1.er préstamo al 0 %';
    return null;
  }

  protected isSectionActive(items: readonly NavigationItem[]): boolean {
    return items.some(item => this.router.url.split(/[?#]/, 1)[0].startsWith('/' + item.path));
  }

  protected togglePanel(panel: 'loans' | 'tools'): void {
    this.desktopPanel.set(this.desktopPanel() === panel ? null : panel);
  }

  protected onPanelKeydown(event: KeyboardEvent, panel: 'loans' | 'tools'): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.desktopPanel.set(panel);
      queueMicrotask(() => (event.currentTarget as HTMLElement | null)?.parentElement?.querySelector<HTMLAnchorElement>('.dropdown-panel a')?.focus());
    }
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.menuOpen.set(true);
      this.document.body.style.overflow = 'hidden';
    }
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.loansOpen.set(false);
    this.toolsOpen.set(false);
    this.desktopPanel.set(null);
    this.document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.document.defaultView && this.document.defaultView.innerWidth >= 900) this.closeMenu();
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
    this.document.body.style.overflow = '';
  }
}
