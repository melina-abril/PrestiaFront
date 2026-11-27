import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lenders' },
  { path: 'lenders', loadChildren: () => import('./features/lenders/lenders.routes').then(m => m.LENDERS_ROUTES) },
  { path: 'herramientas/test-prestamos', loadChildren: () => import('./features/loan-test/loan-test.routes').then(m => m.LOAN_TEST_ROUTES) },
  { path: 'herramientas/calculadora-tae', loadChildren: () => import('./features/apr-calculator/apr-calculator.routes').then(m => m.APR_CALCULATOR_ROUTES) },
  { path: 'como-funciona', loadChildren: () => import('./features/how-it-works/how-it-works.routes').then(m => m.HOW_IT_WORKS_ROUTES) },
  { path: 'blog', loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES) },
  { path: 'contacto', loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES) },
  { path: 'loan-simulator', loadChildren: () => import('./features/loan-simulator/loan-simulator.routes').then(m => m.LOAN_SIMULATOR_ROUTES) },
  { path: 'applications', loadChildren: () => import('./features/loan-applications/loan-applications.routes').then(m => m.LOAN_APPLICATIONS_ROUTES) },
  { path: 'loan-types', loadChildren: () => import('./features/loan-types/loan-types.routes').then(m => m.LOAN_TYPES_ROUTES) },
  { path: '**', redirectTo: 'lenders' },
];
