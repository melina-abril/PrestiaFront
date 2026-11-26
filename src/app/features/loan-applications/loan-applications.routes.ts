import { Routes } from '@angular/router';

export const LOAN_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    title: 'Simulador de préstamos',
    loadComponent: () => import('./pages/simulator-page/simulator-page').then((m) => m.SimulatorPage),
  },
  {
    path: 'apply',
    title: 'Solicitud de préstamo',
    loadComponent: () => import('./pages/application-page/application-page').then((m) => m.ApplicationPage),
  },
];
