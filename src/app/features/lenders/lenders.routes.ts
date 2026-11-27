import { Routes } from '@angular/router';

export const LENDERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Inicio · Credara',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'comparador',
    title: 'Comparador de préstamos · Credara',
    loadComponent: () => import('./pages/comparison-page/comparison-page').then((m) => m.ComparisonPage),
  },
];
