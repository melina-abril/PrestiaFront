import { Routes } from '@angular/router';

export const HOW_IT_WORKS_ROUTES: Routes = [
  {
    path: '',
    title: 'Así funciona Credara',
    loadComponent: () => import('./pages/how-it-works-page/how-it-works-page').then((m) => m.HowItWorksPage),
  },
];
