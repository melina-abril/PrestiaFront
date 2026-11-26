import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LenderResponse } from '../models/lenders.models';

@Component({
  selector: 'app-lender-card',
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="lender-card card">
      <div class="lender-card__mark" aria-hidden="true">{{ lender().acronym }}</div>
      <div class="lender-card__name">
        <h3>{{ lender().name }} @if (lender().recommended) { <span class="lender-card__badge">Recomendada</span> }</h3>
        <span>{{ lender().firstLoanFree ? '1.er préstamo 0 % (30 días)' : 'Sin promoción de bienvenida' }}</span>
      </div>
      <div class="lender-card__fact"><span>Importe</span><strong>{{ lender().minAmount | number:'1.0-0' }}–{{ lender().maxAmount | number:'1.0-0' }} €</strong></div>
      <div class="lender-card__fact"><span>Plazo</span><strong>{{ lender().minTermDays }}–{{ lender().maxTermDays }} días</strong></div>
      <div class="lender-card__fact"><span>Edad</span><strong>{{ lender().minAge }}–{{ lender().maxAge }} años</strong></div>
      <div class="lender-card__fact"><span>Respuesta</span><strong>{{ responseTime() }}</strong></div>
      <a class="button lender-card__action" [routerLink]="requestPath" [queryParams]="requestParams()">Solicitar</a>
      @if (showDetails()) {
        <div class="lender-card__more">
          @if (amount() !== null && days() !== null && lender().totalNew !== null) {
            <span>Total para {{ amount() | number:'1.0-0' }} € a {{ days() }} días: <strong>{{ lender().totalNew | number:'1.0-0' }} €</strong>
              @if (lender().totalRecurring !== null && lender().totalRecurring !== lender().totalNew) { · si ya fuiste cliente: {{ lender().totalRecurring | number:'1.0-0' }} € }
            </span>
          }
          <span>ASNEF: <strong>{{ lender().acceptsAsnef ? 'estudian tu caso' : 'no' }}</strong></span>
          <span>Requisitos: DNI/NIE, cuenta y móvil</span>
        </div>
      }
    </article>
  `,
  styles: `
    .lender-card { display: grid; grid-template-columns: 48px minmax(135px, 1.5fr) repeat(4, minmax(65px, 1fr)) auto; gap: var(--space-md); align-items: center; margin-bottom: var(--space-sm); }
    .lender-card__mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: var(--radius); background: var(--soft-background); color: var(--primary); font-weight: 800; }
    .lender-card__name h3 { margin: 0 0 var(--space-xs); font-size: 1rem; }
    .lender-card__name > span, .lender-card__fact > span { color: var(--text-secondary); font-size: .8rem; }
    .lender-card__badge { display: inline-block; padding: .15rem .45rem; border-radius: var(--radius); background: var(--soft-background); color: var(--primary); font-size: .72rem; }
    .lender-card__fact { display: grid; gap: .3rem; }
    .lender-card__fact strong { white-space: nowrap; font-size: .85rem; }
    .lender-card__action { white-space: nowrap; }
    .lender-card__more { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: var(--space-sm) var(--space-lg); padding-top: var(--space-sm); border-top: 1px solid var(--border); font-size: .8rem; }
    @media (max-width: 1100px) { .lender-card { grid-template-columns: 48px repeat(2, minmax(0, 1fr)); } .lender-card__name { grid-column: span 2; } }
    @media (max-width: 600px) { .lender-card { grid-template-columns: 48px minmax(0, 1fr); } .lender-card__name { grid-column: auto; } .lender-card__action, .lender-card__more { grid-column: 1 / -1; } }
  `,
})
export class LenderCard {
  readonly lender = input.required<LenderResponse>();
  readonly amount = input<number | null>(null);
  readonly days = input<number | null>(null);
  readonly showDetails = input(false);
  readonly requestPath = '/loan-requests';
  protected readonly requestParams = computed(() => ({ amount: this.amount() ?? 300, termDays: this.days() ?? 30 }));
  protected readonly responseTime = computed(() => {
    const minutes = this.lender().responseMinutes;
    return minutes < 60 ? `${minutes} min` : `${Number((minutes / 60).toFixed(1)).toString().replace('.', ',')} h`;
  });
}
