import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

type CookieCategory = 'measurement' | 'marketing';
interface CookieChoice { measurement: boolean; marketing: boolean; date: string; }
const STORAGE_KEY = 'credara.cookies';
const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="footer-logo" routerLink="/" [attr.aria-label]="title + ', ir al inicio'"><span class="logo-mark" aria-hidden="true">◇</span> credara</a>
            <p>Comparamos gratis préstamos online de entidades reguladas y te conectamos con la que mejor encaja contigo.</p>
            <div class="seals"><span>✓ SSL 256-bit</span><span>✓ RGPD</span></div>
          </div>
          <div><h2>Préstamos</h2>@for (item of loans; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
          <div><h2>Herramientas</h2>@for (item of tools; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
          <div><h2>Credara</h2>@for (item of about; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
          <div><h2>Legal</h2>@for (item of legal; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }<button type="button" class="footer-action" (click)="configure()">Configurar cookies</button></div>
        </div>
        <div class="footer-bottom"><span>Credara es un servicio independiente de comparación: no concede préstamos ni cobra al usuario. Las condiciones finales las fija cada entidad y están sujetas a su aprobación. Servicio para mayores de 18 años residentes en España.</span><span>© {{ year }} {{ title }}. Todos los derechos reservados.</span></div>
      </div>
    </footer>
    @if (showNotice()) {
      <aside class="cookie-notice" aria-label="Aviso de cookies">
        <div class="notice-copy"><strong>Usamos cookies</strong><p>Las necesarias para que el sitio funcione y, si aceptas, otras de medición y marketing.</p>
          @if (showSettings()) {
            <div class="cookie-options"><span>Necesarias <small>Siempre activas</small></span><label>Medición <input type="checkbox" [checked]="measurement()" (change)="measurement.set($any($event.target).checked)"></label><label>Marketing <input type="checkbox" [checked]="marketing()" (change)="marketing.set($any($event.target).checked)"></label></div>
          }
        </div>
        <div class="notice-actions">
          @if (showSettings()) {
            <button type="button" class="btn btn--primary" (click)="savePreferences()">Guardar preferencias</button>
          } @else {
            <button type="button" class="btn btn--secondary" (click)="save(false, false)">Solo necesarias</button>
            <button type="button" class="btn btn--secondary" (click)="configure()">Configurar</button>
            <button type="button" class="btn btn--primary" (click)="save(true, true)">Aceptar todas</button>
          }
        </div>
      </aside>
    }
  `,
  styles: `
    .footer { padding: var(--space-8) 0 var(--space-6); background: var(--ink); color: var(--on-primary); }
    .footer-grid { display: grid; grid-template-columns: 1.55fr repeat(4, minmax(0, 1fr)); gap: var(--space-5); }
    .footer-logo { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--on-primary); font: 800 1.375rem var(--font-display); }
    .logo-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--gradient-brand); }
    .footer p { margin-top: var(--space-4); color: var(--on-primary); opacity: .78; font-size: var(--fs-small); }
    .footer h2 { color: var(--on-primary); font-size: var(--fs-small); }
    .footer-grid a:not(.footer-logo), .footer-action { display: block; margin-block: var(--space-2); color: var(--on-primary); font-size: var(--fs-small); opacity: .78; }
    .footer-grid a:hover, .footer-action:hover { opacity: 1; }
    .seals { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .seals span { padding: 5px 10px; border: 1px solid var(--text-secondary); border-radius: var(--radius-pill); font-size: .75rem; }
    .footer-action { padding: 0; border: 0; background: transparent; text-align: left; cursor: pointer; }
    .footer-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-7); padding-top: var(--space-5); border-top: 1px solid var(--text-secondary); font-size: .75rem; opacity: .8; }
    .cookie-notice { position: fixed; bottom: var(--space-5); left: var(--space-5); z-index: 60; display: flex; align-items: center; gap: var(--space-5); max-width: min(840px, calc(100vw - 2 * var(--space-5))); padding: var(--space-5); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .notice-copy strong { font-family: var(--font-display); }
    .notice-copy p { margin: var(--space-1) 0 0; font-size: .8125rem; }
    .notice-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .notice-actions .btn { min-height: 44px; padding-inline: var(--space-4); font-size: .75rem; }
    .cookie-options { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-3); font-size: var(--fs-small); }
    .cookie-options small { display: block; color: var(--text-secondary); }
    @media (max-width: 899px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .footer-brand { grid-column: 1 / -1; } .cookie-notice { flex-direction: column; align-items: stretch; } }
    @media (max-width: 599px) { .footer-grid { grid-template-columns: 1fr; } .footer-brand { grid-column: auto; } .cookie-notice { bottom: var(--space-3); left: var(--space-3); max-width: calc(100vw - 2 * var(--space-3)); } }
  `,
})
export class AppFooter {
  protected readonly title = APP_TITLE;
  protected readonly year = new Date().getFullYear();
  protected readonly showNotice = signal(true);
  protected readonly showSettings = signal(false);
  protected readonly measurement = signal(false);
  protected readonly marketing = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly items: readonly NavigationItem[] = APP_NAVIGATION;
  protected readonly loans = this.items.filter(item => /pr[eé]stamos?/i.test(item.label) && !/simulador|test de/i.test(item.label));
  protected readonly tools = this.items.filter(item => /simulador|calculadora|test de|comparador/i.test(item.label));
  protected readonly about = this.items.filter(item => /c[oó]mo funciona|blog|sobre nosotros|contacto/i.test(item.label));
  protected readonly legal = this.items.filter(item => /privacidad|t[eé]rminos|cookies|aviso legal/i.test(item.label));
  private previous: CookieChoice | null = null;

  constructor() {
    this.previous = this.readChoice();
    if (this.previous) {
      this.measurement.set(this.previous.measurement);
      this.marketing.set(this.previous.marketing);
      this.showNotice.set(false);
    }
  }

  protected configure(): void {
    this.showSettings.set(true);
    this.showNotice.set(true);
  }

  protected savePreferences(): void {
    this.save(this.measurement(), this.marketing());
  }

  protected save(measurement: boolean, marketing: boolean): void {
    const revoked = (this.previous?.measurement && !measurement) || (this.previous?.marketing && !marketing);
    if (this.previous?.measurement && !measurement) this.clearCookies(['_ga', '_ga_*']);
    if (this.previous?.marketing && !marketing) this.clearCookies(['_fbp', '_fbc']);
    const choice: CookieChoice = { measurement, marketing, date: new Date().toISOString() };
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
      this.previous = choice;
    } catch {
      this.previous = null;
      this.measurement.set(false);
      this.marketing.set(false);
    }
    this.showNotice.set(false);
    this.showSettings.set(false);
    if (revoked) this.document.defaultView?.location.reload();
  }

  private readChoice(): CookieChoice | null {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null || !('measurement' in value) || !('marketing' in value) || !('date' in value)) return null;
      if (typeof value.measurement !== 'boolean' || typeof value.marketing !== 'boolean' || typeof value.date !== 'string') return null;
      const age = Date.now() - Date.parse(value.date);
      return Number.isFinite(age) && age >= 0 && age < VALIDITY_MS ? { measurement: value.measurement, marketing: value.marketing, date: value.date } : null;
    } catch {
      return null;
    }
  }

  private clearCookies(names: readonly string[]): void {
    for (const cookie of this.document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (names.some(pattern => pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern)) {
        this.document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      }
    }
  }
}
