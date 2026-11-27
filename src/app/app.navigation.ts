import { NavigationItem } from './core/layout/navigation.model';

export const APP_TITLE = 'Credara · Comparador de préstamos online';

export const APP_NAVIGATION: readonly NavigationItem[] = [
  { path: '/lenders', label: 'Inicio y entidades' },
  { path: '/loan-test', label: 'Test de préstamos' },
  { path: '/apr-calculator', label: 'Calculadora TAE' },
  { path: '/how-it-works', label: 'Cómo funciona' },
  { path: '/contacto', label: 'Contacto' },
  { path: '/loan-types', label: 'Tipos de préstamo' },
  { path: '/articles', label: 'Blog' },
  { path: '/loan-simulator', label: 'Simulador avanzado' },
  { path: '/applications', label: 'Solicitar ofertas' },
  { path: '/about-us', label: 'Sobre nosotros y textos legales' }
];
