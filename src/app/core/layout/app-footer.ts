import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_FOOTER_PATHS, APP_NAV_GROUPS, APP_NAVIGATION, APP_TITLE } from '../../app.navigation';
import type { NavigationItem } from './navigation.model';

interface CookieChoice {
  measurement: boolean;
  marketing: boolean;
  date: string;
}

const COOKIE_KEY = 'credara.cookies';
const COOKIE_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <strong class="footer-logo"><span class="footer-logo__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 17.5 10 6l3.2 6 2.1-3.5L20 17.5H4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg></span>credara</strong>
          <p>Comparamos gratis préstamos online de entidades reguladas y te conectamos con la que mejor encaja contigo.</p>
          <div class="footer-seals"><span>✓ SSL 256-bit</span><span>✓ RGPD</span></div>
        </div>
        <div><h2>Préstamos</h2>@for (item of loans; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div><h2>Herramientas</h2>@for (item of tools; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div><h2>Credara</h2>@for (item of company; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
        <div><h2>Legal</h2>@for (item of legal; track item.path) { <a [routerLink]="'/' + item.path">{{ item.label }}</a> }</div>
      </div>
      <div class="footer-bottom">
        <span>Credara es un servicio independiente de comparación: no concede préstamos ni cobra al usuario. Las condiciones finales las fija cada entidad y están sujetas a su aprobación. Servicio para mayores de 18 años residentes en España.</span>
        <span>© {{ year }} {{ title }}. Todos los derechos reservados.</span>
      </div>
    </footer>
    @if (cookieNotice()) {
      <aside class="cookie-notice" aria-label="Aviso de cookies">
        <div>
          <strong>Usamos cookies</strong>
          <p>Las necesarias para que el sitio funcione y, si aceptas, otras de medición y marketing.</p>
          @if (configuring()) {
            <div class="cookie-options">
              <span>Necesarias · Siempre activas</span>
              <label><input type="checkbox" [checked]="measurement()" (change)="setMeasurement($event)"> Medición</label>
              <label><input type="checkbox" [checked]="marketing()" (change)="setMarketing($event)"> Marketing</label>
            </div>
          }
        </div>
        <div class="cookie-actions">
          @if (configuring()) {
            <button type="button" class="cookie-button cookie-button--primary" (click)="savePreferences()">Guardar preferencias</button>
          } @else {
            <button type="button" class="cookie-button cookie-button--primary" (click)="chooseAll()">Aceptar todas</button>
            <button type="button" class="cookie-button" (click)="chooseNecessary()">Solo necesarias</button>
            <button type="button" class="cookie-button" (click)="configuring.set(true)">Configurar</button>
          }
        </div>
      </aside>
    }
  `,
  styles: `
    .site-footer { padding: var(--space-7) var(--gutter) var(--space-5); background: var(--ink); color: var(--on-primary); }
    .footer-grid { display: grid; grid-template-columns: 1.55fr repeat(4, minmax(0, 1fr)); gap: var(--space-5); }
    .footer-logo { display: flex; align-items: center; gap: var(--space-2); font: 800 1.4rem var(--font-display); }
    .footer-logo__mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--gradient-brand); }
    .footer-logo__mark svg { width: 21px; height: 21px; }
    .footer-brand p { margin-top: var(--space-4); color: var(--on-primary); font-size: var(--fs-small); }
    .footer-seals { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .footer-seals span { padding: 5px 10px; border: 1px solid var(--glass-border); border-radius: var(--radius-pill); font-size: .75rem; font-weight: 700; }
    .footer-grid h2 { margin-bottom: var(--space-4); color: var(--on-primary); font-size: var(--fs-small); }
    .footer-grid a { display: block; margin-bottom: var(--space-2); color: var(--on-primary); font-size: var(--fs-small); }
    .footer-grid a:hover { text-decoration: underline; }
    .footer-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--glass-border); font-size: .75rem; }
    .cookie-notice { position: fixed; z-index: 70; bottom: var(--space-4); left: var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-5); width: min(780px, calc(100% - 2 * var(--space-4))); padding: var(--space-5); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); }
    .cookie-notice strong { color: var(--text-primary); font: 700 var(--fs-body) var(--font-display); }
    .cookie-notice p { margin: var(--space-1) 0 0; font-size: var(--fs-small); }
    .cookie-options { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-3); color: var(--text-primary); font-size: var(--fs-small); }
    .cookie-actions { display: flex; flex-shrink: 0; flex-wrap: wrap; gap: var(--space-2); }
    .cookie-button { min-height: 40px; padding: 0 var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--surface); color: var(--text-primary); font: 700 .75rem var(--font-body); cursor: pointer; }
    .cookie-button--primary { border-color: var(--primary); background: var(--primary); color: var(--on-primary); }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .footer-brand { grid-column: 1 / -1; } }
    @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } .footer-brand { grid-column: auto; } .cookie-notice { flex-direction: column; align-items: stretch; } }
  `,
})
export class AppFooter {
  protected readonly title = APP_TITLE;
  protected readonly year = new Date().getFullYear();
  private readonly document = inject(DOCUMENT);
  private readonly stored = this.readChoice();
  protected readonly cookieNotice = signal(this.stored === null);
  protected readonly configuring = signal(false);
  protected readonly measurement = signal(this.stored?.measurement ?? false);
  protected readonly marketing = signal(this.stored?.marketing ?? false);
  private readonly loanPaths = APP_NAV_GROUPS[0]?.paths ?? [];
  private readonly toolPaths = APP_NAV_GROUPS[1]?.paths ?? [];
  protected readonly loans: readonly NavigationItem[] = APP_NAVIGATION.filter(item => this.loanPaths.includes(item.path));
  protected readonly tools: readonly NavigationItem[] = APP_NAVIGATION.filter(item => this.toolPaths.includes(item.path));
  protected readonly legal: readonly NavigationItem[] = APP_NAVIGATION.filter(item => APP_FOOTER_PATHS.includes(item.path));
  protected readonly company: readonly NavigationItem[] = APP_NAVIGATION.filter(item => item !== APP_NAVIGATION[0] && !this.loanPaths.includes(item.path) && !this.toolPaths.includes(item.path) && !APP_FOOTER_PATHS.includes(item.path));

  protected setMeasurement(event: Event): void {
    this.measurement.set((event.target as HTMLInputElement).checked);
  }

  protected setMarketing(event: Event): void {
    this.marketing.set((event.target as HTMLInputElement).checked);
  }

  protected chooseAll(): void {
    this.measurement.set(true);
    this.marketing.set(true);
    this.savePreferences();
  }

  protected chooseNecessary(): void {
    this.measurement.set(false);
    this.marketing.set(false);
    this.savePreferences();
  }

  protected savePreferences(): void {
    const choice: CookieChoice = { measurement: this.measurement(), marketing: this.marketing(), date: new Date().toISOString() };
    try {
      this.document.defaultView?.localStorage.setItem(COOKIE_KEY, JSON.stringify(choice));
    } catch {
      this.measurement.set(false);
      this.marketing.set(false);
    }
    if (!this.measurement()) this.clearCookies(['_ga', '_ga_*']);
    if (!this.marketing()) this.clearCookies(['_fbp', '_fbc']);
    this.configuring.set(false);
    this.cookieNotice.set(false);
    if ((this.stored?.measurement && !this.measurement()) || (this.stored?.marketing && !this.marketing())) {
      this.document.defaultView?.location.reload();
    }
  }

  private readChoice(): CookieChoice | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(COOKIE_KEY);
      if (!value) return null;
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null || !('date' in parsed) || !('measurement' in parsed) || !('marketing' in parsed) || typeof parsed.date !== 'string' || typeof parsed.measurement !== 'boolean' || typeof parsed.marketing !== 'boolean') return null;
      const age = Date.now() - Date.parse(parsed.date);
      return Number.isFinite(age) && age >= 0 && age < COOKIE_LIFETIME_MS ? { date: parsed.date, measurement: parsed.measurement, marketing: parsed.marketing } : null;
    } catch {
      return null;
    }
  }

  private clearCookies(names: readonly string[]): void {
    for (const cookie of this.document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (names.some(pattern => pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern)) {
        this.document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
      }
    }
  }
}
