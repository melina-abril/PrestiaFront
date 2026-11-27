import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./welcome-page').then(m => m.WelcomePage),
  },
  { path: '**', redirectTo: '' },
];
