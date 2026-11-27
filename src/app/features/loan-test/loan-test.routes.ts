import { Routes } from '@angular/router';

export const LOAN_TEST_ROUTES: Routes = [
  {
    path: '',
    title: 'Test de préstamos | Credara',
    loadComponent: () => import('./pages/loan-test-page/loan-test-page').then((m) => m.LoanTestPage),
  },
];
