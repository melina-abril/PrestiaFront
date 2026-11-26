import { Routes } from '@angular/router';

export const LOAN_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    title: 'Simulador de préstamos · Prestia',
    loadComponent: () => import('./pages/loan-landing-page/loan-landing-page').then((m) => m.LoanLandingPage),
  },
  {
    path: 'apply',
    title: 'Completa tu solicitud · Prestia',
    loadComponent: () => import('./pages/loan-application-page/loan-application-page').then((m) => m.LoanApplicationPage),
  },
];
