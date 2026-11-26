import { Routes } from '@angular/router';

export const LOAN_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Solicitud de ofertas · Credara',
    loadComponent: () => import('./pages/loan-request-page/loan-request-page').then((m) => m.LoanRequestPage),
  },
  {
    path: 'simulator',
    title: 'Simulador de préstamos · Credara',
    loadComponent: () => import('./pages/loan-simulator-page/loan-simulator-page').then((m) => m.LoanSimulatorPage),
  },
];
