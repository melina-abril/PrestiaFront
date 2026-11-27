import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LenderResponse, responseTime } from '../models/lenders.models';

@Component({
  selector: 'app-lender-card',
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card lender-card">
      <div class="lender-card__heading">
        <span class="lender-card__initials" aria-hidden="true">{{ lender().initials }}</span>
        <div><h3>{{ lender().name }}</h3><span>{{ lender().firstLoanFree ? '1.er préstamo 0 % (30 días)' : 'Sin promoción de bienvenida' }}</span></div>
        @if (lender().recommended) { <span class="badge badge--success">Recomendada</span> }
      </div>
      <dl class="lender-card__facts">
        <div><dt>Importe</dt><dd>{{ lender().minAmount | number:'1.0-0' }}–{{ lender().maxAmount | number:'1.0-0' }} €</dd></div>
        <div><dt>Plazo</dt><dd>{{ lender().minTermDays }}–{{ lender().maxTermDays }} días</dd></div>
        <div><dt>Edad</dt><dd>{{ lender().minAge }}–{{ lender().maxAge }} años</dd></div>
        <div><dt>Respuesta</dt><dd>{{ responseTime(lender().responseMinutes) }}</dd></div>
      </dl>
      @if (amount() !== undefined && termDays() !== undefined && lender().totalNew !== undefined) {
        <p class="lender-card__total">Total para {{ amount() | number:'1.0-0' }} € a {{ termDays() }} días: <strong>{{ lender().totalNew | number:'1.0-0' }} €</strong>
          @if (lender().totalReturning !== lender().totalNew) { · si ya fuiste cliente: {{ lender().totalReturning | number:'1.0-0' }} € }
        </p>
      }
      <p class="lender-card__conditions">ASNEF: {{ lender().acceptsAsnef ? 'estudian tu caso' : 'no' }} · Requisitos: DNI/NIE, cuenta y móvil</p>
      @if (applicationRoute()) {
        <a class="btn btn--solid" [routerLink]="applicationRoute()" [queryParams]="{ amount: requestAmount(), termDays: requestTermDays() }">Solicitar →</a>
      } @else { <span class="btn btn--secondary" aria-disabled="true">Solicitar</span> }
    </article>
  `,
  styles: `
    .lender-card { display: grid; gap: var(--space-4); min-width: 0; }
    .lender-card__heading { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-3); }
    .lender-card__heading h3 { margin: 0; font-size: var(--fs-h4); }
    .lender-card__heading div > span { color: var(--text-secondary); font-size: var(--fs-small); }
    .lender-card__initials { display: grid; place-items: center; flex: 0 0 44px; height: 44px; border-radius: var(--radius-sm); background: var(--soft-background); color: var(--primary); font-weight: 800; }
    .lender-card__facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-3); margin: 0; }
    .lender-card__facts dt { color: var(--text-secondary); font-size: var(--fs-small); }
    .lender-card__facts dd { margin: 0; font-weight: 700; }
    .lender-card__total { margin: 0; padding-top: var(--space-3); border-top: 1px solid var(--border); }
    .lender-card__total strong { color: var(--primary); }
    .lender-card__conditions { margin: 0; font-size: var(--fs-small); }
    .lender-card .btn { justify-self: start; }
    @media (max-width: 650px) { .lender-card__facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class LenderCard {
  readonly lender = input.required<LenderResponse>();
  readonly amount = input<number>();
  readonly termDays = input<number>();
  readonly requestAmount = input(300);
  readonly requestTermDays = input(30);
  readonly applicationRoute = input<string | null>(null);
  protected readonly responseTime = responseTime;
}
