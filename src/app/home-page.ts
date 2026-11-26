import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <main class="home-page">
      <h1>Prestia · Simulador de préstamos</h1>
      <p>Próximamente podrás simular un préstamo y consultar ofertas desde aquí.</p>
    </main>
  `,
  styles: [`
    .home-page {
      width: 100%;
      padding: var(--space-lg);
      color: var(--text-primary);
    }
    h1 {
      margin: 0 0 var(--space-sm);
      font-size: 1.5rem;
    }
    p {
      margin: 0;
      color: var(--text-secondary);
    }
  `]
})
export class HomePage {}
