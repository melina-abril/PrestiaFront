import { Routes } from '@angular/router';

export const LOAN_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    title: 'Solicitud de ofertas',
    loadComponent: () => import('./pages/application-page/application-page').then((m) => m.ApplicationPage),
  },
];
