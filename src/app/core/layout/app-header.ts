import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';

const LOAN_TYPES = [
  { title: 'Préstamos rápidos', detail: 'Dinero en tu cuenta en minutos' },
  { title: 'Préstamos online', detail: 'Todo el trámite desde casa' },
  { title: 'Préstamos sin nómina', detail: 'Con otros ingresos demostrables' },
  { title: 'Primer préstamo gratis', detail: '0 % los primeros 30 días' },
] as const;

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topbar">
      <span>Comparador gratuito de préstamos de entidades reguladas</span>
      <a href="mailto:contacto@prestia.example">Ayuda · contacto@prestia.example</a>
    </div>
    <header class="site-header">
      <div class="site-header__inner">
        @if (home(); as landing) {
          <a class="logo" [routerLink]="'/' + landing.path" (click)="closeMenus()"><span class="logo-mark" aria-hidden="true">P</span>Prestia</a>
        } @else {
          <span class="logo"><span class="logo-mark" aria-hidden="true">P</span>Prestia</span>
        }
        <nav class="desktop-nav" aria-label="Navegación principal">
          <div class="dropdown" (mouseenter)="loansOpen.set(true)" (mouseleave)="loansOpen.set(false)">
            <button #loansTrigger type="button" class="nav-link" aria-controls="loan-options" [attr.aria-expanded]="loansOpen()" (click)="loansOpen.set(!loansOpen())">Préstamos <span aria-hidden="true">⌄</span></button>
            @if (loansOpen()) {
              <div id="loan-options" class="loan-menu">
                @for (loan of loanTypes; track loan.title) {
                  @if (home(); as landing) {
                    <a [routerLink]="'/' + landing.path" (click)="closeMenus()">{{ loan.title }}<small>{{ loan.detail }}</small></a>
                  } @else {
                    <span>{{ loan.title }}<small>{{ loan.detail }}</small></span>
                  }
                }
              </div>
            }
          </div>
          @for (item of mainItems(); track item.path) {
            <a class="nav-link" [routerLink]="'/' + item.path" routerLinkActive="nav-link--active" [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page">{{ item.path === home()?.path ? 'Simulador' : item.label }}</a>
          }
          @if (home(); as landing) {
            <a class="nav-link" [routerLink]="'/' + landing.path" fragment="como-funciona">Cómo funciona</a>
            <a class="nav-link" [routerLink]="'/' + landing.path" fragment="preguntas-frecuentes">Preguntas frecuentes</a>
          } @else {
            <span class="nav-link">Cómo funciona</span><span class="nav-link">Preguntas frecuentes</span>
          }
        </nav>
        <div class="header-actions">
          <span class="secure" aria-label="100% seguro">🔒 100% seguro</span>
          @if (request(); as application) {
            <a class="apply-button" [routerLink]="'/' + application.path" queryParamsHandling="preserve" (click)="closeMenus()">Solicitar préstamo</a>
          }
          <button #mobileTrigger class="burger" type="button" aria-controls="mobile-navigation" [attr.aria-expanded]="mobileOpen()" [attr.aria-label]="mobileOpen() ? 'Cerrar menú' : 'Abrir menú'" (click)="toggleMobile()">{{ mobileOpen() ? '✕' : '☰' }}</button>
        </div>
      </div>
      @if (mobileOpen()) {
        <nav id="mobile-navigation" class="mobile-nav" aria-label="Navegación móvil">
          <span class="mobile-heading">Préstamos</span>
          @for (loan of loanTypes; track loan.title) {
            @if (home(); as landing) {
              <a class="mobile-sub" [routerLink]="'/' + landing.path" (click)="closeMenus()">{{ loan.title }}</a>
            } @else {
              <span class="mobile-sub">{{ loan.title }}</span>
            }
          }
          @for (item of mainItems(); track item.path) {
            <a [routerLink]="'/' + item.path" routerLinkActive="nav-link--active" ariaCurrentWhenActive="page" (click)="closeMenus()">{{ item.path === home()?.path ? 'Simulador' : item.label }}</a>
          }
          @if (home(); as landing) {
            <a [routerLink]="'/' + landing.path" fragment="como-funciona" (click)="closeMenus()">Cómo funciona</a>
            <a [routerLink]="'/' + landing.path" fragment="preguntas-frecuentes" (click)="closeMenus()">Preguntas frecuentes</a>
          }
          @if (request(); as application) {
            <a class="apply-button" [routerLink]="'/' + application.path" queryParamsHandling="preserve" (click)="closeMenus()">Solicitar préstamo</a>
          }
        </nav>
      }
    </header>
  `,
  styles: `
    .topbar { display: flex; justify-content: space-between; gap: var(--space-md); padding: var(--space-sm) var(--space-lg); background: var(--primary); color: var(--surface); font-size: 0.75rem; }
    .topbar a { color: var(--surface); text-decoration: none; }
    .topbar a:hover { text-decoration: underline; }
    .site-header { position: sticky; top: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--border); background: var(--surface); color: var(--text-primary); }
    .site-header__inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); padding: var(--space-md) var(--space-lg); }
    .logo { display: inline-flex; align-items: center; gap: var(--space-sm); color: var(--text-primary); font-size: 1.3rem; font-weight: 700; text-decoration: none; white-space: nowrap; }
    .logo-mark { display: inline-grid; width: 2rem; height: 2rem; place-items: center; border-radius: var(--radius); background: var(--primary); color: var(--surface); font-size: 1.2rem; }
    .desktop-nav, .header-actions { display: flex; align-items: center; gap: var(--space-md); }
    .nav-link { display: inline-flex; align-items: center; gap: var(--space-xs); border: 0; background: none; color: var(--text-primary); font: inherit; font-size: 0.875rem; text-decoration: none; white-space: nowrap; cursor: pointer; }
    .nav-link:hover, .nav-link--active { color: var(--primary); font-weight: 700; }
    .dropdown { position: relative; }
    .loan-menu { position: absolute; top: 100%; left: 0; display: grid; width: 17rem; padding: var(--space-sm); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
    .loan-menu a, .loan-menu span { display: grid; gap: var(--space-xs); padding: var(--space-sm); border-radius: var(--radius); color: var(--text-primary); font-size: 0.875rem; text-decoration: none; }
    .loan-menu a:hover, .loan-menu a:focus-visible { background: var(--soft-background); color: var(--primary); }
    .loan-menu small { color: var(--text-secondary); }
    .secure { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; }
    .apply-button { display: inline-flex; justify-content: center; padding: var(--space-sm) var(--space-md); border-radius: var(--radius); background: var(--primary); color: var(--surface); font-size: 0.875rem; font-weight: 600; text-decoration: none; white-space: nowrap; }
    .apply-button:hover { background: var(--accent); }
    .burger { display: none; border: 0; background: none; color: var(--primary); font-size: 1.5rem; cursor: pointer; }
    .mobile-nav { display: none; }
    :is(a, button):focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (max-width: 900px) {
      .desktop-nav, .secure { display: none; }
      .burger { display: block; }
      .mobile-nav { display: grid; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border); background: var(--surface); }
      .mobile-nav a, .mobile-nav span { padding: var(--space-sm); color: var(--text-primary); text-decoration: none; }
      .mobile-nav .mobile-sub { padding-left: var(--space-lg); color: var(--text-secondary); }
      .mobile-nav .nav-link--active { color: var(--primary); font-weight: 700; }
      .mobile-nav .apply-button { color: var(--surface); }
    }
    @media (max-width: 600px) {
      .topbar { justify-content: flex-end; padding-inline: var(--space-md); }
      .topbar span { display: none; }
      .site-header__inner, .mobile-nav { padding-inline: var(--space-md); }
      .header-actions { gap: var(--space-sm); }
    }
  `,
})
export class AppHeader implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly loansTrigger = viewChild<ElementRef<HTMLButtonElement>>('loansTrigger');
  private readonly mobileTrigger = viewChild<ElementRef<HTMLButtonElement>>('mobileTrigger');
  protected readonly title = APP_TITLE;
  protected readonly loanTypes = LOAN_TYPES;
  protected readonly loansOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly home = computed(() => APP_NAVIGATION[0]);
  protected readonly request = computed(() => APP_NAVIGATION.find(item => /solicitud|application|apply/i.test(item.path + ' ' + item.label)));
  protected readonly mainItems = computed(() => APP_NAVIGATION.filter(item => item.path !== this.request()?.path));

  protected toggleMobile(): void {
    this.mobileOpen.update(open => !open);
    document.body.style.overflow = this.mobileOpen() ? 'hidden' : '';
  }

  protected closeMenus(): void {
    this.loansOpen.set(false);
    this.mobileOpen.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  protected onOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target)) this.closeMenus();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.loansOpen()) this.loansTrigger()?.nativeElement.focus();
    if (this.mobileOpen()) this.mobileTrigger()?.nativeElement.focus();
    this.closeMenus();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
