import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { calculateLoan } from '../../../loan-common/loan-calculation';
import { SimulationSession } from '../../../loan-common/simulation-session.service';
import { LenderCard } from '../../components/lender-card';
import { LendersService } from '../../data-access/lenders.service';
import { LenderResponse } from '../../models/lenders.models';

const FAQ = [
  { question: '¿Credara concede préstamos?', answer: 'No. Comparamos ofertas de entidades reguladas; el préstamo lo concede la entidad que elijas.' },
  { question: '¿Cuánto cuesta usar el comparador?', answer: 'Nada. El servicio es gratuito para el usuario.' },
  { question: '¿Qué requisitos necesito?', answer: 'Ser mayor de edad, residir en España con DNI o NIE, tener una cuenta bancaria a tu nombre, móvil y correo.' },
  { question: '¿Puedo pedir con ASNEF?', answer: 'Algunas entidades estudian solicitudes con ASNEF. Las marcamos en el comparador.' },
  { question: '¿Cuándo recibo el dinero?', answer: 'Desde 15 minutos hasta 24 horas, según la entidad y tu banco.' },
] as const;

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, DatePipe, DecimalPipe, LenderCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit, OnDestroy {
  private readonly session = inject(SimulationSession);
  private readonly lenders = inject(LendersService);
  private readonly document = inject(DOCUMENT);
  private faqScript: HTMLScriptElement | null = null;
  private readonly initial = this.session.load(this.session.homeDefaults);

  protected readonly amount = signal(this.initial.amount);
  protected readonly termDays = signal(this.initial.termDays);
  protected readonly calculation = computed(() => calculateLoan(this.amount(), this.termDays()));
  protected readonly faq = FAQ;
  protected readonly featuredState = toSignal(
    toObservable(signal(true)).pipe(switchMap(() => toLoadState(this.lenders.list({ featured: true, order: 'recommended', page: 0, size: 3 })))),
    { initialValue: { status: 'loading' } as LoadState<Page<LenderResponse>> },
  );
  protected readonly applicationRoute = '/applications';

  ngOnInit(): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    });
    this.document.head.appendChild(script);
    this.faqScript = script;
  }

  ngOnDestroy(): void {
    this.faqScript?.remove();
  }

  protected changeAmount(value: string): void {
    this.amount.set(Number(value));
    this.session.save(this.amount(), this.termDays());
  }

  protected changeTerm(value: string): void {
    this.termDays.set(Number(value));
    this.session.save(this.amount(), this.termDays());
  }

  protected scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
