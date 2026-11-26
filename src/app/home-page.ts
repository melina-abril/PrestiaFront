import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <main class="welcome">
      <div class="welcome__content">
        <span class="welcome__eyebrow">Credara</span>
        <h1>Compara préstamos con claridad</h1>
        <p>Estamos preparando las herramientas para ayudarte a conocer los costes y comparar opciones. Credara compara e intermedia; no concede préstamos.</p>
      </div>
    </main>
  `,
  styles: [`
    .welcome {
      display: grid;
      align-items: center;
      width: 100%;
      min-height: 60dvh;
      padding: var(--space-xl);
      background: var(--gradient-hero);
    }
    .welcome__content {
      max-width: 48rem;
    }
    .welcome__eyebrow {
      color: var(--primary);
      font-family: var(--font-display);
      font-weight: 800;
      letter-spacing: var(--tracking-eyebrow);
      text-transform: uppercase;
    }
    h1 {
      margin: var(--space-md) 0;
      color: var(--text-primary);
      font-family: var(--font-display);
      font-size: var(--fs-h1);
      line-height: var(--lh-tight);
    }
    p {
      max-width: 38rem;
      color: var(--text-secondary);
      font-size: var(--fs-lead);
      line-height: var(--lh-body);
    }
    @media (max-width: 600px) {
      .welcome {
        padding: var(--space-md);
      }
    }
  `]
})
export class HomePage {}
