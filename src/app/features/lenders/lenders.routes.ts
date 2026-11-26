import { Routes } from '@angular/router';

export const LENDERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Inicio · Credara',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'comparador',
    title: 'Comparador de entidades · Credara',
    loadComponent: () => import('./pages/comparator-page/comparator-page').then((m) => m.ComparatorPage),
  },
];
