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
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle(APP_TITLE);
  }

  protected focusContent(): void {
    this.document.getElementById('contenido')?.focus();
  }
}
