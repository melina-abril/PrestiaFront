import { Routes } from '@angular/router';

/** Registrar ABOUT_AND_LEGAL_ROUTES en /sobre-nosotros y LEGAL_ROUTES en /legal. */
export const ABOUT_AND_LEGAL_ROUTES: Routes = [
  {
    path: '',
    title: 'Sobre nosotros · Credara',
    loadComponent: () => import('./pages/about-page/about-page').then((m) => m.AboutPage),
  },
];

export const LEGAL_ROUTES: Routes = [
  {
    path: ':text',
    title: 'Textos legales · Credara',
    loadComponent: () => import('./pages/legal-page/legal-page').then((m) => m.LegalPage),
  },
];
