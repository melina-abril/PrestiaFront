import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { LEGAL_DOCUMENTS } from '../../models/legal-documents';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  readonly slug = input.required<string>();
  private readonly router = inject(Router);
  protected readonly documents = LEGAL_DOCUMENTS;
  protected readonly document = computed(() => this.documents.find((item) => item.slug === this.slug()) ?? null);
  protected readonly cookiesOpen = signal(false);
  protected readonly analyticsAllowed = signal(false);

  protected chooseDocument(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement && this.documents.some((item) => item.slug === target.value)) {
      void this.router.navigate(['/about-us', 'legal', target.value]);
    }
  }

  protected print(): void {
    const style = document.createElement('style');
    style.textContent = '@media print { body * { visibility: hidden !important; } #credara-print-document, #credara-print-document * { visibility: visible !important; } #credara-print-document { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; box-shadow: none !important; border: 0 !important; } #credara-print-document .print-action { display: none !important; } }';
    document.head.appendChild(style);
    window.addEventListener('afterprint', () => style.remove(), { once: true });
    window.print();
  }

  protected openCookieSettings(): void {
    this.cookiesOpen.set(true);
    window.dispatchEvent(new Event('credara:open-cookie-settings'));
  }

  protected saveCookieSettings(): void {
    try {
      localStorage.setItem('credara.cookie-preferences', JSON.stringify({ analytics: this.analyticsAllowed(), updatedAt: new Date().toISOString() }));
    } catch {
      // La configuración sigue siendo accesible si el almacenamiento está bloqueado.
    }
    this.cookiesOpen.set(false);
    window.dispatchEvent(new Event('credara:cookie-preferences-changed'));
  }
}
