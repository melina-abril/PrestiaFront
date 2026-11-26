import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { LenderCard } from '../../components/lender-card';
import { LendersService } from '../../data-access/lenders.service';
import { LoanSimulationService } from '../../../loan-requests/data-access/loan-simulation.service';
import { calculateLoan } from '../../../loan-requests/models/loan-calculation';

const FAQ = [
  { question: '¿Credara concede préstamos?', answer: 'No. Comparamos ofertas de entidades reguladas; el préstamo lo concede la entidad que elijas.' },
  { question: '¿Cuánto cuesta usar el comparador?', answer: 'Nada. El servicio es gratuito para el usuario.' },
  { question: '¿Qué requisitos necesito?', answer: 'Ser mayor de edad, residir en España con DNI o NIE, tener una cuenta bancaria a tu nombre, móvil y correo.' },
  { question: '¿Puedo pedir con ASNEF?', answer: 'Algunas entidades estudian solicitudes con ASNEF. Las marcamos en el comparador.' },
  { question: '¿Cuándo recibo el dinero?', answer: 'Desde 15 minutos hasta 24 horas, según la entidad y tu banco.' },
] as const;

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, DecimalPipe, RouterLink, LenderCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly lenders = inject(LendersService);
  private readonly simulation = inject(LoanSimulationService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly amount = signal(300);
  protected readonly days = signal(30);
  protected readonly faq = FAQ;
  protected readonly quote = computed(() => {
    const calculation = calculateLoan(this.amount(), this.days());
    const rounded = (interest: number): { interest: number; total: number; tae: number } => {
      const whole = Math.round(interest);
      return {
        interest: whole,
        total: this.amount() + whole,
        tae: Math.round((Math.pow(1 + whole / this.amount(), 365 / this.days()) - 1) * 100),
      };
    };
    return { ...calculation, newCustomer: rounded(calculation.newCustomer.interest), returningCustomer: rounded(calculation.returningCustomer.interest) };
  });
  private readonly featuredRequest = signal(0);
  protected readonly featuredState = toSignal(
    toObservable(this.featuredRequest).pipe(switchMap(() => this.lenders.listLenders({ featured: true }))),
    { initialValue: null },
  );
  protected readonly openQuestions = signal<ReadonlySet<number>>(new Set([0]));

  constructor() {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });
    this.document.head.appendChild(script);
    inject(DestroyRef).onDestroy(() => script.remove());
  }

  protected setAmount(value: string): void {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0) return;
    this.amount.set(amount);
    this.simulation.set(amount, this.days());
  }

  protected setDays(value: string): void {
    const days = Number(value);
    if (!Number.isInteger(days) || days < 7 || days > 90) return;
    this.days.set(days);
    this.simulation.set(this.amount(), days);
  }

  protected findLoan(): void {
    this.simulation.set(this.amount(), this.days());
    void this.router.navigate(['/loan-requests'], { queryParams: { amount: this.amount(), termDays: this.days() } });
  }

  protected scrollToCalculator(): void {
    this.document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected toggleQuestion(index: number): void {
    this.openQuestions.update((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }
}
