import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAVIGATION } from '../../app.navigation';
import { NavigationItem } from './navigation.model';

/** Conserva el selector y la navegación real; el marco actual muestra el menú en el encabezado. */
@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Secciones del sistema">
      @for (item of items(); track item.path) {
        <a [routerLink]="'/' + item.path" routerLinkActive="active" ariaCurrentWhenActive="page">{{ item.label }}</a>
      }
    </nav>
  `,
  styles: `
    nav { display: grid; gap: var(--space-2); padding: var(--space-5); }
    a { padding: var(--space-3); border-radius: var(--radius-sm); color: var(--text-primary); }
    a:hover, a.active { background: var(--active-item); color: var(--primary); }
  `,
})
export class SideNav {
  protected readonly items = signal<readonly NavigationItem[]>(APP_NAVIGATION).asReadonly();
}
