import { Routes } from '@angular/router';

export const APR_CALCULATOR_ROUTES: Routes = [
  {
    path: '',
    title: 'Calculadora TAE | Credara',
    loadComponent: () => import('./pages/apr-calculator-page/apr-calculator-page').then((m) => m.AprCalculatorPage),
  },
];
