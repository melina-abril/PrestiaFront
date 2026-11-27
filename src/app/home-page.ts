import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <main class="container section">
      <span class="eyebrow">Credara</span>
      <h1>Compara préstamos con claridad</h1>
      <p class="lead">Pronto podrás consultar y comparar opciones de préstamo sin registrarte. Credara compara e intermedia; no concede préstamos.</p>
    </main>
  `,
})
export class HomePage {}
