import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="header-row">
        <a class="brand" routerLink="/" [attr.aria-label]="title + ', ir al inicio'" (click)="closeAll()">
          <span class="brand-mark"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 17.5 10 6l3.2 6 2.1-3.5L20 17.5H4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 17.5 13.2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>
          credara<span class="brand-dot" aria-hidden="true"></span>
        </a>
        <nav class="desktop-nav" aria-label="Navegación principal">
          @if (loans().length) {
            <div class="nav-group" (mouseenter)="panel.set('loans')" (mouseleave)="panel.set(null)">
              <button type="button" class="nav-link" [class.is-active]="activeGroup() === 'loans'" [attr.aria-expanded]="panel() === 'loans'" aria-controls="loans-panel" (click)="togglePanel('loans')">Préstamos <span aria-hidden="true">⌄</span></button>
              @if (panel() === 'loans') {
                <div class="dropdown loans-panel" id="loans-panel">
                  <span class="eyebrow">Encuentra lo que necesitas</span>
                  <strong class="dropdown-title">Préstamos para cada momento</strong>
                  <div class="loan-grid">
                    @for (item of loans(); track item.path; let index = $index) {
                      <a class="loan-link" [routerLink]="'/' + item.path" (click)="closeAll()"><span class="loan-number">{{ index + 1 }}</span>{{ item.label }}</a>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @for (item of otherItems(); track item.path) {
            <a class="nav-link" [routerLink]="'/' + item.path" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page" (click)="closeAll()">{{ item.label }}</a>
          }
          @if (tools().length) {
            <div class="nav-group" (mouseenter)="panel.set('tools')" (mouseleave)="panel.set(null)">
              <button type="button" class="nav-link" [class.is-active]="activeGroup() === 'tools'" [attr.aria-expanded]="panel() === 'tools'" aria-controls="tools-panel" (click)="togglePanel('tools')">Herramientas <span aria-hidden="true">⌄</span></button>
              @if (panel() === 'tools') {
                <div class="dropdown tools-panel" id="tools-panel">
                  @for (item of tools(); track item.path) {
                    <a class="dropdown-link" [routerLink]="'/' + item.path" (click)="closeAll()">{{ item.label }}</a>
                  }
                </div>
              }
            </div>
          }
        </nav>
        <div class="header-actions">
          <span class="safety"><svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2 17 5v5c0 4.3-2.7 6.8-7 8-4.3-1.2-7-3.7-7-8V5l7-3Z" stroke="currentColor" stroke-width="1.7"/><path d="m7 10 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>100% seguro</span>
          @if (simulator(); as destination) {
            <a class="btn btn--solid request-link" [routerLink]="'/' + destination.path" (click)="closeAll()">Solicitar préstamo <span aria-hidden="true">→</span></a>
          }
          <button class="mobile-toggle" type="button" [attr.aria-label]="mobileOpen() ? 'Cerrar menú' : 'Abrir menú'" [attr.aria-expanded]="mobileOpen()" aria-controls="mobile-navigation" (click)="toggleMobile()">{{ mobileOpen() ? '✕' : '☰' }}</button>
        </div>
      </div>
      @if (mobileOpen()) {
        <nav class="mobile-menu" id="mobile-navigation" aria-label="Navegación móvil">
          @if (loans().length) {
            <button type="button" class="mobile-group" [attr.aria-expanded]="mobileLoans()" (click)="mobileLoans.set(!mobileLoans())">Préstamos <span aria-hidden="true">⌄</span></button>
            @if (mobileLoans()) {
              @for (item of loans(); track item.path) {
                <a class="mobile-link nested" [routerLink]="'/' + item.path" (click)="closeAll()">{{ item.label }}</a>
              }
            }
          }
          @for (item of otherItems(); track item.path) {
            <a class="mobile-link" [routerLink]="'/' + item.path" (click)="closeAll()">{{ item.label }}</a>
          }
          @if (tools().length) {
            <button type="button" class="mobile-group" [attr.aria-expanded]="mobileTools()" (click)="mobileTools.set(!mobileTools())">Herramientas <span aria-hidden="true">›</span></button>
            @if (mobileTools()) {
              @for (item of tools(); track item.path) {
                <a class="mobile-link nested" [routerLink]="'/' + item.path" (click)="closeAll()">{{ item.label }}</a>
              }
            }
          }
          @if (simulator(); as destination) {
            <a class="btn btn--solid mobile-request" [routerLink]="'/' + destination.path" (click)="closeAll()">Solicitar préstamo →</a>
          }
        </nav>
      }
    </header>
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 50; width: 100%; padding: var(--space-4) var(--gutter); background: var(--gradient-hero); }
    .site-header { position: relative; max-width: var(--container); margin-inline: auto; }
    .header-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 10px 12px 10px 20px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--glass-bg); backdrop-filter: var(--glass-blur); box-shadow: var(--shadow-md); }
    .brand { display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0; color: var(--text-primary); font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; letter-spacing: var(--tracking-tight); }
    .brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--gradient-brand); color: var(--on-primary); box-shadow: var(--shadow-brand); }
    .brand-dot { width: 7px; height: 7px; margin: 12px 0 0 -7px; border-radius: 50%; background: var(--accent); }
    .desktop-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-1); min-width: 0; }
    .nav-group { position: relative; }
    .nav-link { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--text-primary); font: 600 .875rem var(--font-body); text-decoration: none; white-space: nowrap; cursor: pointer; }
    .nav-link:hover, .nav-link.is-active { background: var(--active-item); color: var(--primary); font-weight: 700; }
    .dropdown { position: absolute; top: 100%; left: 0; min-width: 230px; padding: var(--space-5); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .loans-panel { width: min(780px, 90vw); }
    .dropdown-title { display: block; margin-bottom: var(--space-4); font-family: var(--font-display); font-size: var(--fs-h3); }
    .loan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
    .loan-link { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: var(--fs-small); font-weight: 600; }
    .loan-link:hover { border-color: var(--primary-300); color: var(--primary); }
    .loan-number { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--radius-sm); background: var(--soft-background); color: var(--primary); }
    .dropdown-link { display: block; padding: var(--space-3); border-radius: var(--radius-sm); }
    .dropdown-link:hover { background: var(--soft-background); }
    .header-actions { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
    .safety { display: inline-flex; align-items: center; gap: 6px; color: var(--success); font-size: .75rem; font-weight: 700; white-space: nowrap; }
    .request-link { min-height: 44px; padding-inline: 18px; font-size: .8125rem; }
    .mobile-toggle, .mobile-menu { display: none; }
    @media (max-width: 899px) {
      .desktop-nav, .safety, .request-link { display: none; }
      .mobile-toggle { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 50%; background: var(--surface); color: var(--text-primary); font-size: 1.375rem; cursor: pointer; }
      .mobile-menu { display: grid; position: absolute; top: calc(100% + var(--space-2)); left: 0; right: 0; max-height: calc(100dvh - 100px); overflow: auto; padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); box-shadow: var(--shadow-lg); }
      .mobile-group, .mobile-link { display: block; width: 100%; padding: var(--space-3); border: 0; background: transparent; color: var(--text-primary); font: 600 var(--fs-small) var(--font-body); text-align: left; }
      .mobile-group { cursor: pointer; }
      .mobile-link.nested { padding-left: var(--space-6); color: var(--primary); }
      .mobile-request { width: 100%; margin-top: var(--space-3); }
    }
  `,
})
export class AppHeader implements OnDestroy {
  protected readonly title = APP_TITLE;
  protected readonly items: readonly NavigationItem[] = APP_NAVIGATION;
  protected readonly loans = computed(() => this.items.filter(item => /pr[eé]stamos?/i.test(item.label) && !/simulador/i.test(item.label)));
  protected readonly tools = computed(() => this.items.filter(item => /simulador|calculadora|test de pr[eé]stamos/i.test(item.label)));
  protected readonly otherItems = computed(() => this.items.filter(item => !this.loans().includes(item) && !this.tools().includes(item)));
  protected readonly simulator = computed(() => this.tools().find(item => /simulador/i.test(item.label)) ?? null);
  protected readonly panel = signal<'loans' | 'tools' | null>(null);
  protected readonly mobileOpen = signal(false);
  protected readonly mobileLoans = signal(false);
  protected readonly mobileTools = signal(false);
  protected readonly activeGroup = computed(() => this.loans().some(item => this.routePath() === item.path || this.routePath().startsWith(item.path + '/')) ? 'loans' : this.tools().some(item => this.routePath() === item.path || this.routePath().startsWith(item.path + '/')) ? 'tools' : null);
  private readonly routePath = signal('');
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    this.updateRoute();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      this.updateRoute();
      this.closeAll();
    });
  }

  protected togglePanel(name: 'loans' | 'tools'): void {
    this.panel.set(this.panel() === name ? null : name);
  }

  protected toggleMobile(): void {
    this.mobileOpen.set(!this.mobileOpen());
    this.document.body.style.overflow = this.mobileOpen() ? 'hidden' : '';
  }

  protected closeAll(): void {
    this.panel.set(null);
    this.mobileOpen.set(false);
    this.mobileLoans.set(false);
    this.mobileTools.set(false);
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeAll();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.document.defaultView && this.document.defaultView.innerWidth >= 900) this.closeAll();
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  private updateRoute(): void {
    this.routePath.set(this.router.url.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, ''));
  }
}
