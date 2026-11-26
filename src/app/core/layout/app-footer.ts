import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

type CookieCategory = 'measurement' | 'marketing';
interface CookieChoice {
  measurement: boolean;
  marketing: boolean;
  date: string;
}

const COOKIE_KEY = 'credara.cookies';
const CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="brand-column">
          <div class="logo"><span class="logo-mark" aria-hidden="true">C</span>{{ brand }}</div>
          <p>Comparamos gratis préstamos online de entidades reguladas y te conectamos con la que mejor encaja contigo.</p>
          <div class="badges"><span>SSL 256-bit</span><span>RGPD</span></div>
        </div>
        <div><h2>Préstamos</h2><ul>@for (item of loans; track item.path) { <li><a [routerLink]="'/' + item.path">{{ item.label }}</a></li> }</ul></div>
        <div><h2>Herramientas</h2><ul>@for (item of tools; track item.path) { <li><a [routerLink]="'/' + item.path">{{ item.label }}</a></li> }</ul></div>
        <div><h2>Credara</h2><ul>@for (item of company; track item.path) { <li><a [routerLink]="'/' + item.path">{{ item.label }}</a></li> }</ul></div>
        <div><h2>Legal</h2><ul>@for (item of legal; track item.path) { <li><a [routerLink]="'/' + item.path">{{ item.label }}</a></li> }</ul><li class="cookie-settings"><button type="button" (click)="configureCookies()">Configurar cookies</button></li></div>
      </div>
      <div class="footer-legal">
        <p>Credara es un servicio independiente de comparación: no concede préstamos ni cobra al usuario. Las condiciones finales las fija cada entidad y están sujetas a su aprobación. Servicio para mayores de 18 años residentes en España.</p>
        <p>© {{ year }} {{ brand }}. Todos los derechos reservados.</p>
      </div>
    </footer>
    @if (showCookies()) {
      <aside class="cookie-notice" aria-label="Preferencias de cookies">
        @if (configuring()) {
          <strong>Configurar cookies</strong>
          <div class="cookie-category"><span>Necesarias</span><span>Siempre activas</span></div>
          <label class="cookie-category"><span>Medición</span><input type="checkbox" [checked]="measurement()" (change)="measurement.set($any($event.target).checked)" /></label>
          <label class="cookie-category"><span>Marketing</span><input type="checkbox" [checked]="marketing()" (change)="marketing.set($any($event.target).checked)" /></label>
          <button type="button" class="cookie-button cookie-button--primary" (click)="savePreferences()">Guardar preferencias</button>
        } @else {
          <strong>Usamos cookies</strong>
          <p>Las necesarias para que el sitio funcione y, si aceptas, otras de medición y marketing.</p>
          <div class="cookie-actions">
            <button type="button" class="cookie-button cookie-button--primary" (click)="saveChoice(true, true)">Aceptar todas</button>
            <button type="button" class="cookie-button" (click)="saveChoice(false, false)">Solo necesarias</button>
            <button type="button" class="cookie-button" (click)="configureCookies()">Configurar</button>
          </div>
        }
      </aside>
    }
  `,
  styles: `
    .site-footer { padding: 2.5rem var(--space-lg) var(--space-lg); background: var(--text-primary); color: var(--surface); }
    .footer-grid { display: grid; grid-template-columns: minmax(12rem, 1.7fr) repeat(4, minmax(0, 1fr)); gap: 2rem; width: 100%; }
    .logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 750; }
    .logo-mark { display: inline-grid; place-items: center; width: 2rem; height: 2rem; border-radius: 7px; background: var(--primary); color: var(--surface); }
    .brand-column p, .footer-legal { font-size: 0.85rem; line-height: 1.6; }
    .badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .badges span { padding: 0.25rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.75rem; }
    h2 { margin: 0 0 0.9rem; font-size: 0.95rem; }
    ul { margin: 0; padding: 0; list-style: none; }
    li { margin-bottom: 0.65rem; }
    a, .cookie-settings button { border: 0; background: transparent; color: var(--surface); font: inherit; font-size: 0.85rem; text-align: left; text-decoration: none; cursor: pointer; }
    a:hover, .cookie-settings button:hover { text-decoration: underline; }
    .cookie-settings { list-style: none; }
    .cookie-settings button { padding: 0; }
    .footer-legal { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); }
    .footer-legal p { margin: 0.4rem 0; }
    .cookie-notice { position: fixed; bottom: 1rem; left: 1rem; z-index: 30; width: min(27rem, calc(100vw - 2rem)); padding: 1rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); font-size: 0.875rem; }
    .cookie-notice strong { display: block; margin-bottom: 0.5rem; font-size: 1rem; }
    .cookie-notice p { margin: 0 0 1rem; color: var(--text-secondary); line-height: 1.5; }
    .cookie-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .cookie-button { padding: 0.55rem 0.7rem; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--primary); font: inherit; font-size: 0.8rem; cursor: pointer; }
    .cookie-button--primary { border-color: var(--primary); background: var(--primary); color: var(--surface); }
    .cookie-category { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px solid var(--border); }
    .cookie-category:last-of-type { margin-bottom: 0.8rem; }
    :host a:focus-visible, :host button:focus-visible, :host input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (min-width: 600px) and (max-width: 899px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 599px) { .site-footer { padding: 2rem var(--space-md); } .footer-grid { grid-template-columns: 1fr; gap: 1.4rem; } }
  `,
})
export class AppFooter implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  protected readonly brand = APP_TITLE.split(' · ')[0];
  protected readonly year = new Date().getFullYear();
  protected readonly loans: readonly NavigationItem[] = APP_NAVIGATION.filter(item => /pr[eé]stam|loan/i.test(item.path + ' ' + item.label));
  protected readonly tools: readonly NavigationItem[] = APP_NAVIGATION.filter(item => /simulador|calculadora|test|tae|comparador|simulator|calculator|comparison/i.test(item.path + ' ' + item.label) && !this.loans.includes(item));
  protected readonly legal: readonly NavigationItem[] = APP_NAVIGATION.filter(item => /legal|privacidad|cookies|t[eé]rminos|privacy|terms/i.test(item.path + ' ' + item.label) && !this.loans.includes(item) && !this.tools.includes(item));
  protected readonly company: readonly NavigationItem[] = APP_NAVIGATION.filter(item => !this.loans.includes(item) && !this.tools.includes(item) && !this.legal.includes(item));
  protected readonly showCookies = signal(true);
  protected readonly configuring = signal(false);
  protected readonly measurement = signal(false);
  protected readonly marketing = signal(false);
  private readonly configureListener = (): void => this.configureCookies();

  constructor() {
    this.document.addEventListener('credara:configure-cookies', this.configureListener);
    const saved = this.readChoice();
    if (saved) {
      this.measurement.set(saved.measurement);
      this.marketing.set(saved.marketing);
      this.showCookies.set(false);
    }
  }

  protected configureCookies(): void {
    const saved = this.readChoice();
    this.measurement.set(saved?.measurement ?? false);
    this.marketing.set(saved?.marketing ?? false);
    this.configuring.set(true);
    this.showCookies.set(true);
  }

  protected savePreferences(): void {
    this.saveChoice(this.measurement(), this.marketing());
  }

  protected saveChoice(measurement: boolean, marketing: boolean): void {
    const previous = this.readChoice();
    try {
      this.document.defaultView?.localStorage.setItem(COOKIE_KEY, JSON.stringify({ measurement, marketing, date: new Date().toISOString() } satisfies CookieChoice));
    } catch {
      measurement = false;
      marketing = false;
    }
    this.measurement.set(measurement);
    this.marketing.set(marketing);
    this.configuring.set(false);
    this.showCookies.set(false);
    if (previous?.measurement && !measurement) this.removeCookies(['_ga', '_ga_*']);
    if (previous?.marketing && !marketing) this.removeCookies(['_fbp', '_fbc']);
    if ((previous?.measurement && !measurement) || (previous?.marketing && !marketing)) this.document.defaultView?.location.reload();
  }

  private readChoice(): CookieChoice | null {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(COOKIE_KEY);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null || !('date' in value) || !('measurement' in value) || !('marketing' in value) || typeof value.date !== 'string' || typeof value.measurement !== 'boolean' || typeof value.marketing !== 'boolean') return null;
      const timestamp = Date.parse(value.date);
      if (!Number.isFinite(timestamp) || Date.now() - timestamp > CONSENT_DURATION || timestamp > Date.now()) return null;
      return { date: value.date, measurement: value.measurement, marketing: value.marketing };
    } catch {
      return null;
    }
  }

  private removeCookies(patterns: readonly string[]): void {
    const names = this.document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]);
    for (const name of names) {
      if (patterns.some(pattern => pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern)) {
        this.document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    }
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('credara:configure-cookies', this.configureListener);
  }
}
