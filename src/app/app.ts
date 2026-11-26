import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { APP_TITLE } from './app.navigation';
import { AppFooter } from './core/layout/app-footer';
import { AppHeader } from './core/layout/app-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Title).setTitle(APP_TITLE);
  }

  skipToContent(): void {
    const content = this.document.getElementById('contenido');
    content?.focus();
    content?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
