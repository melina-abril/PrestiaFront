import { Routes } from '@angular/router';

export const LENDERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Credara · Compara préstamos',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'compare',
    title: 'Comparador de entidades · Credara',
    loadComponent: () => import('./pages/comparison-page/comparison-page').then((m) => m.ComparisonPage),
  },
];
