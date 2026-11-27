import { NavigationItem } from './core/layout/navigation.model';

export const APP_TITLE = 'Credara · Comparador de préstamos online';

export const APP_NAVIGATION: readonly NavigationItem[] = [
  { path: 'lenders', label: 'Inicio y comparador' },
  { path: 'loan-simulator', label: 'Simulador de préstamos' },
  { path: 'applications', label: 'Solicitar ofertas' },
  { path: 'loan-types', label: 'Tipos de préstamo' },
];

export const APP_FOOTER_PATHS: readonly string[] = [];

export const APP_NAV_GROUPS: readonly { label: string; paths: readonly string[] }[] = [];
