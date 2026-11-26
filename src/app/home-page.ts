import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <main class="home-page">
      <section class="home-page__panel" aria-labelledby="home-title">
        <h1 id="home-title">Bienvenido a Credara</h1>
        <p>Estamos preparando el comparador de préstamos online.</p>
      </section>
    </main>
  `,
  styles: `
    .home-page {
      width: 100%;
      padding: var(--space-lg);
    }
    .home-page__panel {
      padding: var(--space-lg);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    h1 {
      margin: 0 0 var(--space-sm);
      color: var(--text-primary);
      font-size: 1.5rem;
    }
    p {
      margin: 0;
      color: var(--text-secondary);
    }
  `
})
export class HomePage {}
