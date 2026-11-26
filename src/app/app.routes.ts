import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: '<main class="card"><h1>Bienvenido a Prestia</h1><p>Próximamente podrás simular y comparar préstamos desde aquí.</p></main>',
})
class HomePage {}

export const routes: Routes = [
  { path: '', component: HomePage, pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
