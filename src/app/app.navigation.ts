import { NavigationItem } from './core/layout/navigation.model';

export const APP_TITLE = 'Credara · Comparador de préstamos online';

export const APP_NAVIGATION: readonly NavigationItem[] = [
  { path: 'lenders', label: 'Inicio y comparador de entidades' },
  { path: 'sobre-nosotros', label: 'Sobre nosotros' },
  { path: 'herramientas/test-prestamos', label: 'Test de préstamos' },
  { path: 'herramientas/calculadora-tae', label: 'Calculadora TAE' },
  { path: 'como-funciona', label: 'Cómo funciona' },
  { path: 'blog', label: 'Blog' },
  { path: 'contacto', label: 'Contacto' },
  { path: 'loan-simulator', label: 'Simulador avanzado' },
  { path: 'applications', label: 'Solicitar ofertas' },
  { path: 'loan-types', label: 'Tipos de préstamo' },
];

export const APP_FOOTER_PATHS: readonly string[] = [
  'sobre-nosotros',
  'contacto',
];

export const APP_NAV_GROUPS: readonly { label: string; paths: readonly string[] }[] = [
  { label: 'Herramientas', paths: ['herramientas/test-prestamos', 'herramientas/calculadora-tae', 'loan-simulator'] },
  { label: 'Préstamos', paths: ['applications', 'loan-types'] },
];
