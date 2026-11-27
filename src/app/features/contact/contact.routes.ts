import { Routes } from '@angular/router';

export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    title: 'Contacto | Credara',
    loadComponent: () => import('./pages/contact-page/contact-page').then((m) => m.ContactPage),
  },
];
