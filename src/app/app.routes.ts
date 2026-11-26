import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'loan-applications' },
  {
    path: 'loan-applications',
    loadChildren: () => import('./features/loan-applications/loan-applications.routes').then(m => m.LOAN_APPLICATIONS_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
