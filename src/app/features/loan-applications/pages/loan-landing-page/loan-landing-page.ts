import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoanVisitService } from '../../data-access/loan-visit.service';
import { calculateLoan } from '../../models/loan-calculation';

@Component({
  selector: 'app-loan-landing-page',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './loan-landing-page.html',
  styleUrl: './loan-landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanLandingPage {
  protected readonly visit = inject(LoanVisitService);
  protected readonly calculation = computed(() => calculateLoan(this.visit.amount(), this.visit.termDays()));
  protected readonly terms = [7, 15, 30, 60, 90].map((days) => ({ days, result: calculateLoan(500, days) }));
  protected readonly steps = [
    { title: 'Simula', description: 'Elige monto y plazo y mira el costo real.' },
    { title: 'Completa tus datos', description: 'Datos personales e ingresos en menos de 2 minutos.' },
    { title: 'Compara ofertas', description: 'Analizamos tu perfil y te mostramos las entidades que te aceptan.' },
    { title: 'Recibe el dinero', description: 'Firmas con la entidad elegida y cobras en tu cuenta.' },
  ];
  protected readonly benefits = [
    { title: 'Transparencia', description: 'Ves intereses, TAE y total a devolver antes de dar ningún dato.' },
    { title: 'Comparación', description: 'Comparas el costo como cliente nuevo y como recurrente.' },
    { title: 'Planificación', description: 'Sabes la fecha exacta de devolución y puedes organizarte.' },
    { title: 'Sin compromiso', description: 'Simular no afecta tu historial crediticio.' },
  ];

  protected setAmount(value: string): void {
    const amount = Number(value);
    if (Number.isInteger(amount) && amount >= 50 && amount <= 2000 && amount % 50 === 0) this.visit.update({ amount });
  }

  protected setDays(value: string): void {
    const termDays = Number(value);
    if (Number.isInteger(termDays) && termDays >= 7 && termDays <= 90) this.visit.update({ termDays });
  }
}
