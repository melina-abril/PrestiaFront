import { Routes } from '@angular/router';

export const LOAN_TYPES_ROUTES: Routes = [
  {
    path: '',
    title: 'Tipos de préstamo | Credara',
    loadComponent: () => import('./pages/loan-types-page/loan-types-page').then((m) => m.LoanTypesPage),
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/loan-type-detail-page/loan-type-detail-page').then((m) => m.LoanTypeDetailPage),
  },
];
