import { ChangeDetectionStrategy, Component } from '@angular/core';

/** El menú de este sitio está en el encabezado; se conserva el selector público. */
@Component({
  selector: 'app-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class SideNav {}
