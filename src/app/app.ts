import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { APP_NAVIGATION, APP_TITLE } from './app.navigation';
import { AppFooter } from './core/layout/app-footer';
import { AppHeader } from './core/layout/app-header';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface CookieChoice {
  measurement: boolean;
  marketing: boolean;
  expires: number;
}

const COOKIE_KEY = 'prestia-cookie-preferences';
const COOKIE_DURATION = 365 * 24 * 60 * 60 * 1000;

function storedChoice(): CookieChoice | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || !('expires' in value) || !('measurement' in value) || !('marketing' in value)) return null;
    if (typeof value.expires !== 'number' || value.expires <= Date.now() || typeof value.measurement !== 'boolean' || typeof value.marketing !== 'boolean') return null;
    return { expires: value.expires, measurement: value.measurement, marketing: value.marketing };
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AppHeader, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), map(event => event.urlAfterRedirects)), { initialValue: this.router.url });
  protected readonly activeSection = signal<string | null>(null);
  protected readonly choice = signal<CookieChoice | null>(storedChoice());
  protected readonly configuringCookies = signal(false);
  protected readonly measurement = signal(this.choice()?.measurement ?? false);
  protected readonly marketing = signal(this.choice()?.marketing ?? false);
  protected readonly showCookieNotice = computed(() => this.choice() === null || this.configuringCookies());
  protected readonly breadcrumbs = computed<readonly Breadcrumb[]>(() => {
    const home = APP_NAVIGATION[0];
    if (!home) return [];
    const homePath = '/' + home.path;
    const request = APP_NAVIGATION.find(item => /solicitud|application|apply/i.test(item.path + ' ' + item.label));
    const url = this.currentUrl().split(/[?#]/, 1)[0].replace(/\/$/, '');
    const current = APP_NAVIGATION.find(item => url === '/' + item.path || url.startsWith('/' + item.path + '/'));
    if (!current || current.path === home.path) {
      return [{ label: 'Inicio', path: homePath }, { label: 'Herramientas', path: homePath }, { label: 'Simulador de préstamos' }];
    }
    if (request && current.path === request.path) {
      return [{ label: 'Inicio', path: homePath }, { label: 'Simulador', path: homePath }, { label: 'Solicitud' }];
    }
    return [{ label: 'Inicio', path: homePath }, { label: current.label }];
  });

  constructor() {
    inject(Title).setTitle(APP_TITLE);
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSection.set(id);
  }

  protected configureCookies(): void {
    this.measurement.set(this.choice()?.measurement ?? false);
    this.marketing.set(this.choice()?.marketing ?? false);
    this.configuringCookies.set(true);
  }

  protected saveCookies(measurement: boolean, marketing: boolean): void {
    const choice: CookieChoice = { measurement, marketing, expires: Date.now() + COOKIE_DURATION };
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(choice));
      this.choice.set(choice);
    } catch {
      // Sin almacenamiento, solo se usan las cookies necesarias durante esta visita.
      this.choice.set({ measurement: false, marketing: false, expires: choice.expires });
    }
    this.configuringCookies.set(false);
  }
}
