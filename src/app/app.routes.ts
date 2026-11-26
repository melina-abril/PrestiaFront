import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lenders' },
  {
    path: 'lenders',
    loadChildren: () => import('./features/lenders/lenders.routes').then(m => m.LENDERS_ROUTES)
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: 'contacto',
    loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
  },
  {
    path: 'loan-requests',
    loadChildren: () => import('./features/loan-requests/loan-requests.routes').then(m => m.LOAN_REQUESTS_ROUTES)
  },
  {
    path: 'loan-types',
    loadChildren: () => import('./features/loan-types/loan-types.routes').then(m => m.LOAN_TYPES_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
