import { NavigationItem } from './core/layout/navigation.model';

export const APP_TITLE = 'Credara · Comparador de préstamos online';

export const APP_NAVIGATION: readonly NavigationItem[] = [
  { path: '/lenders', label: 'Inicio y comparador' },
  { path: '/loan-requests', label: 'Simulador y solicitud' },
  { path: '/loan-types', label: 'Tipos de préstamo' }
];
