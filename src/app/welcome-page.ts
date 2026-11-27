import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  template: `
    <main class="welcome" aria-labelledby="welcome-title">
      <div class="welcome__content">
        <h1 id="welcome-title">Bienvenido a Credara</h1>
        <p>Estamos preparando el comparador de préstamos para ti.</p>
      </div>
    </main>
  `,
  styles: [`
    .welcome {
      display: grid;
      min-height: 50dvh;
      padding: var(--space-6);
      place-items: center;
      background: var(--background);
    }
    .welcome__content {
      max-width: 40rem;
      text-align: center;
    }
  `],
})
export class WelcomePage {}
