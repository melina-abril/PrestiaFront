import { Routes } from '@angular/router';

export const LOAN_SIMULATOR_ROUTES: Routes = [
  {
    path: '',
    title: 'Simulador de préstamos online',
    loadComponent: () => import('./pages/loan-simulator-page/loan-simulator-page').then((m) => m.LoanSimulatorPage),
  },
];
