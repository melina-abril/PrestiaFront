import { Routes } from '@angular/router';

export const ABOUT_LEGAL_ROUTES: Routes = [
  {
    path: '',
    title: 'Sobre nosotros · Credara',
    loadComponent: () => import('./pages/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'legal/:slug',
    title: 'Textos legales · Credara',
    loadComponent: () => import('./pages/legal-page/legal-page').then((m) => m.LegalPage),
  },
];
