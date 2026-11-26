import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAVIGATION, APP_TITLE } from '../../app.navigation';

const LOANS = ['Préstamos rápidos', 'Préstamos online', 'Préstamos sin nómina', 'Primer préstamo gratis'] as const;
const LEGAL = ['Política de privacidad', 'Términos y condiciones', 'Política de cookies', 'Aviso legal'] as const;

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <div class="logo"><span class="logo-mark" aria-hidden="true">P</span>{{ title }}</div>
          <p>Comparamos ofertas de préstamos online de entidades reguladas. Gratis y sin compromiso.</p>
          <div class="badges"><span>SSL 256-bit</span><span>Protección de datos</span></div>
        </div>
        <div><h2>Préstamos</h2><ul>
          @for (loan of loans; track loan) {
            <li>@if (home; as landing) { <a [routerLink]="'/' + landing.path">{{ loan }}</a> } @else { <span>{{ loan }}</span> }</li>
          }
        </ul></div>
        <div><h2>Herramientas</h2><ul>
          <li>@if (home; as landing) { <a [routerLink]="'/' + landing.path">Simulador de préstamos</a> } @else { <span>Simulador de préstamos</span> }</li>
          <li>@if (home; as landing) { <a [routerLink]="'/' + landing.path" fragment="como-funciona">Cómo funciona</a> } @else { <span>Cómo funciona</span> }</li>
          <li>@if (home; as landing) { <a [routerLink]="'/' + landing.path" fragment="preguntas-frecuentes">Preguntas frecuentes</a> } @else { <span>Preguntas frecuentes</span> }</li>
          <li><a href="mailto:contacto@prestia.example">Contacto</a></li>
        </ul></div>
        <div><h2>Legal</h2><ul>
          @for (label of legal; track label) {
            <li>
              @if (legalRoute(label); as path) { <a [routerLink]="path">{{ label }}</a> }
              @else if (label === 'Política de cookies') { <button type="button" (click)="cookiePreferences.emit()">Configurar cookies</button> }
              @else { <span>{{ label }}</span> }
            </li>
          }
          <li><button type="button" (click)="cookiePreferences.emit()">Preferencias de cookies</button></li>
        </ul></div>
      </div>
      <div class="footer-legal">
        <p>Prestia es un comparador independiente: no concede préstamos, te conecta con entidades financieras reguladas. Solo para mayores de 18 años.</p>
        <p>© {{ year }} {{ title }}. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: `
    .site-footer { padding: var(--space-lg); background: var(--text-primary); color: var(--surface); font-size: 0.875rem; }
    .footer-grid { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: var(--space-lg); }
    .logo { display: flex; align-items: center; gap: var(--space-sm); font-size: 1.15rem; font-weight: 700; }
    .logo-mark { display: inline-grid; width: 2rem; height: 2rem; place-items: center; border-radius: var(--radius); background: var(--accent); color: var(--text-primary); }
    .footer-grid p { max-width: 22rem; line-height: 1.6; }
    .footer-grid h2 { margin-top: 0; font-size: 0.95rem; }
    .footer-grid ul { display: grid; gap: var(--space-sm); margin: 0; padding: 0; list-style: none; }
    .footer-grid a, .footer-grid button, .footer-grid li span { color: var(--surface); font: inherit; font-size: 0.8rem; }
    .footer-grid a { text-decoration: none; }
    .footer-grid button { padding: 0; border: 0; background: none; text-align: left; cursor: pointer; }
    .footer-grid a:hover, .footer-grid button:hover { text-decoration: underline; }
    .badges { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .badges span { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--text-secondary); border-radius: var(--radius); font-size: 0.75rem; }
    .footer-legal { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--text-secondary); font-size: 0.75rem; }
    .footer-legal p { margin: 0; }
    :is(a, button):focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .site-footer { padding: var(--space-md); } .footer-grid { gap: var(--space-md); } }
  `,
})
export class AppFooter {
  readonly cookiePreferences = output<void>();
  protected readonly title = APP_TITLE;
  protected readonly year = new Date().getFullYear();
  protected readonly home = APP_NAVIGATION[0];
  protected readonly loans = LOANS;
  protected readonly legal = LEGAL;

  protected legalRoute(label: string): string | undefined {
    const item = APP_NAVIGATION.find(entry => entry.label.toLocaleLowerCase() === label.toLocaleLowerCase());
    return item ? '/' + item.path : undefined;
  }
}
