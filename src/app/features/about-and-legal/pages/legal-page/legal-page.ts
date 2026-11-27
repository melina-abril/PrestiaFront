import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL_DOCUMENTS } from '../../models/legal.models';

const COOKIE_PREFERENCE_KEY = 'credara.analytics-cookies';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  readonly text = input.required<string>();

  protected readonly documents = LEGAL_DOCUMENTS;
  protected readonly document = computed(() => this.documents.find((item) => item.slug === this.text()) ?? null);
  protected readonly cookieSettingsOpen = signal(false);
  protected readonly analyticsAllowed = signal(false);

  protected printDocument(): void {
    window.print();
  }

  protected openCookieSettings(): void {
    try {
      this.analyticsAllowed.set(localStorage.getItem(COOKIE_PREFERENCE_KEY) === 'true');
    } catch {
      this.analyticsAllowed.set(false);
    }
    this.cookieSettingsOpen.set(true);
  }

  protected saveCookieSettings(): void {
    try {
      localStorage.setItem(COOKIE_PREFERENCE_KEY, String(this.analyticsAllowed()));
    } catch {
      // La elección sigue activa durante esta visita aunque el almacenamiento esté bloqueado.
    }
    this.cookieSettingsOpen.set(false);
    window.dispatchEvent(new CustomEvent('credara:cookie-preferences-changed', {
      detail: { analytics: this.analyticsAllowed() },
    }));
  }
}
