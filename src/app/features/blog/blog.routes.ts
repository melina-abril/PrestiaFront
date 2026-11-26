import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    title: 'Blog de finanzas personales',
    loadComponent: () => import('./pages/blog-page/blog-page').then((m) => m.BlogPage),
  },
  {
    path: ':slug',
    title: 'Artículo · Credara',
    loadComponent: () => import('./pages/article-page/article-page').then((m) => m.ArticlePage),
  },
];
