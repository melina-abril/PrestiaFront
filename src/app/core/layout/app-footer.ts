import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

type CookieChoice = { necessary: true; measurement: boolean; marketing: boolean; date: string };
const COOKIE_KEY = 'credara.cookies';
const COOKIE_LIFETIME = 365 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <strong class="footer-logo"><span class="footer-mark" aria-hidden="true"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M4 17.5 10 6l3.2 6 2.1-3.5L20 17.5H4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg></span>credara</strong>
          <p>Comparamos gratis préstamos online de entidades reguladas y te conectamos con la que mejor encaja contigo.</p>
          <div class="seals"><span>✓ SSL 256-bit</span><span>✓ RGPD</span></div>
        </div>
        <div class="footer-column"><strong>Préstamos</strong>@for (item of loanItems; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div class="footer-column"><strong>Herramientas</strong>@for (item of toolItems; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div class="footer-column"><strong>Credara</strong>@for (item of companyItems; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div class="footer-column"><strong>Legal</strong>@for (item of legalItems; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }<button type="button" (click)="configureCookies()">Configurar cookies</button></div>
      </div>
      <div class="footer-bottom"><span>Credara es un servicio independiente de comparación: no concede préstamos ni cobra al usuario. Las condiciones finales las fija cada entidad y están sujetas a su aprobación. Servicio para mayores de 18 años residentes en España.</span><span>© {{ year }} {{ title }}. Todos los derechos reservados.</span></div>
    </footer>
    @if (showNotice()) {
      <aside class="cookie-notice" aria-label="Aviso de cookies">
        <div class="cookie-copy"><strong>Usamos cookies</strong><p>Las necesarias para que el sitio funcione y, si aceptas, otras de medición y marketing.</p>
          @if (showSettings()) {
            <div class="cookie-settings">
              <label>Necesarias <span>Siempre activas</span><input type="checkbox" checked disabled></label>
              <label>Medición <input type="checkbox" [checked]="measurement()" (change)="measurement.set($any($event.target).checked)"></label>
              <label>Marketing <input type="checkbox" [checked]="marketing()" (change)="marketing.set($any($event.target).checked)"></label>
            </div>
          }
        </div>
        <div class="cookie-actions">
          @if (showSettings()) {
            <button type="button" class="cookie-primary" (click)="savePreferences()">Guardar preferencias</button>
          } @else {
            <button type="button" class="cookie-primary" (click)="choose(true, true)">Aceptar todas</button>
            <button type="button" (click)="choose(false, false)">Solo necesarias</button>
            <button type="button" (click)="showSettings.set(true)">Configurar</button>
          }
        </div>
      </aside>
    }
  `,
  styles: `
    .site-footer { padding: 48px 32px 24px; background: var(--ink); color: var(--on-primary); }
    .footer-grid { display: grid; grid-template-columns: 1.55fr repeat(4, minmax(0, 1fr)); gap: 24px; }
    .footer-logo { display: flex; align-items: center; gap: 8px; font: 800 1.4375rem var(--font-display); letter-spacing: -.03em; }
    .footer-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--gradient-brand); color: var(--on-primary); }
    .footer-brand p { margin: 16px 0; color: var(--on-primary); font-size: .8125rem; line-height: 1.6; opacity: .72; }
    .seals { display: flex; flex-wrap: wrap; gap: 8px; }
    .seals span { padding: 5px 10px; border: 1px solid var(--text-secondary); border-radius: var(--radius-pill); font-size: .6875rem; font-weight: 700; }
    .footer-column strong { display: block; margin-bottom: 14px; font-size: .875rem; }
    .footer-column a, .footer-column button { display: block; margin-bottom: 8px; padding: 0; border: 0; background: transparent; color: var(--on-primary); font: 400 .8125rem var(--font-body); text-align: left; opacity: .75; cursor: pointer; }
    .footer-column a:hover, .footer-column button:hover { opacity: 1; text-decoration: underline; }
    .footer-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--text-secondary); font-size: .75rem; opacity: .75; }
    .footer-bottom span:first-child { max-width: 740px; }
    .cookie-notice { position: fixed; z-index: 60; bottom: 16px; left: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; width: min(760px, calc(100% - 48px)); padding: 20px 24px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .cookie-copy strong { font: 700 .9375rem var(--font-display); color: var(--text-primary); }
    .cookie-copy p { margin: 4px 0; color: var(--text-secondary); font-size: .75rem; line-height: 1.55; }
    .cookie-settings { display: grid; gap: 8px; margin-top: 12px; }
    .cookie-settings label { display: flex; align-items: center; gap: 12px; color: var(--text-primary); font-size: .8125rem; }
    .cookie-settings span { color: var(--text-secondary); }
    .cookie-settings input { accent-color: var(--primary); }
    .cookie-actions { display: flex; flex-wrap: wrap; gap: 8px; flex-shrink: 0; }
    .cookie-actions button { min-height: 44px; padding: 0 16px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface); color: var(--text-primary); font: 700 .75rem var(--font-body); cursor: pointer; }
    .cookie-actions .cookie-primary { border-color: var(--primary); background: var(--primary); color: var(--on-primary); box-shadow: var(--shadow-brand); }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .footer-brand { grid-column: 1 / -1; } .cookie-notice { align-items: flex-start; flex-direction: column; } }
    @media (max-width: 599px) { .site-footer { padding: 40px 20px 24px; } .footer-grid { grid-template-columns: 1fr; } .footer-brand { grid-column: auto; } .cookie-notice { left: 12px; bottom: 12px; width: calc(100% - 24px); padding: 16px; } }
  `,
})
export class AppFooter {
  protected readonly title = APP_TITLE;
  protected readonly year = new Date().getFullYear();
  private readonly document = inject(DOCUMENT);
  private readonly items: readonly NavigationItem[] = APP_NAVIGATION;
  protected readonly loanItems = this.items.filter(item => /pr[eé]stam|prestamos/i.test(item.label + ' ' + item.path));
  protected readonly toolItems = this.items.filter(item => /simulador|calculadora|\btest\b|comparador/i.test(item.label + ' ' + item.path));
  protected readonly legalItems = this.items.filter(item => /legal|privacidad|cookies|t[eé]rminos|aviso/i.test(item.label + ' ' + item.path));
  protected readonly companyItems = this.items.filter(item => /c[oó]mo funciona|blog|nosotros|contacto/i.test(item.label + ' ' + item.path));
  protected readonly showNotice = signal(!this.readChoice());
  protected readonly showSettings = signal(false);
  protected readonly measurement = signal(false);
  protected readonly marketing = signal(false);

  protected configureCookies(): void {
    const choice = this.readChoice();
    this.measurement.set(choice?.measurement ?? false);
    this.marketing.set(choice?.marketing ?? false);
    this.showSettings.set(true);
    this.showNotice.set(true);
  }

  protected choose(measurement: boolean, marketing: boolean): void {
    const previous = this.readChoice();
    const choice: CookieChoice = { necessary: true, measurement, marketing, date: new Date().toISOString() };
    try {
      this.document.defaultView?.localStorage.setItem(COOKIE_KEY, JSON.stringify(choice));
      if (!this.document.defaultView?.localStorage.getItem(COOKIE_KEY)) throw new Error('Storage unavailable');
      this.showNotice.set(false);
      this.showSettings.set(false);
      if (previous && ((previous.measurement && !measurement) || (previous.marketing && !marketing))) {
        if (previous.measurement && !measurement) this.clearCookies(['_ga', '_ga_*']);
        if (previous.marketing && !marketing) this.clearCookies(['_fbp', '_fbc']);
        this.document.defaultView.location.reload();
      }
    } catch {
      this.measurement.set(false);
      this.marketing.set(false);
      this.showNotice.set(false);
      this.showSettings.set(false);
    }
  }

  protected savePreferences(): void {
    this.choose(this.measurement(), this.marketing());
  }

  private readChoice(): CookieChoice | null {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(COOKIE_KEY);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null || !('date' in value) || !('measurement' in value) || !('marketing' in value)) return null;
      if (typeof value.date !== 'string' || typeof value.measurement !== 'boolean' || typeof value.marketing !== 'boolean') return null;
      const time = Date.parse(value.date);
      if (!Number.isFinite(time) || time > Date.now() || Date.now() - time >= COOKIE_LIFETIME) return null;
      return { necessary: true, date: value.date, measurement: value.measurement, marketing: value.marketing };
    } catch {
      return null;
    }
  }

  private clearCookies(patterns: readonly string[]): void {
    const cookies = this.document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]);
    for (const cookie of cookies) {
      if (patterns.some(pattern => pattern.endsWith('*') ? cookie.startsWith(pattern.slice(0, -1)) : cookie === pattern)) {
        this.document.cookie = cookie + '=; Max-Age=0; path=/; SameSite=Lax';
      }
    }
  }
}
