import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lenders' },
  {
    path: 'lenders',
    loadChildren: () => import('./features/lenders/lenders.routes').then(m => m.LENDERS_ROUTES),
  },
  {
    path: 'loan-simulator',
    loadChildren: () => import('./features/loan-simulator/loan-simulator.routes').then(m => m.LOAN_SIMULATOR_ROUTES),
  },
  {
    path: 'applications',
    loadChildren: () => import('./features/loan-applications/loan-applications.routes').then(m => m.LOAN_APPLICATIONS_ROUTES),
  },
  {
    path: 'loan-types',
    loadChildren: () => import('./features/loan-types/loan-types.routes').then(m => m.LOAN_TYPES_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
