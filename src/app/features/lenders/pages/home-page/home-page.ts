import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { LoadingState } from '../../../../shared/components/loading-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { calculateLoan } from '../../../loan-simulator/shared/loan-calculation';
import { LoanSimulationStore } from '../../../loan-simulator/shared/loan-simulation-store';
import { LendersService } from '../../data-access/lenders.service';
import { Lender, responseTime } from '../../models/lenders.models';

const FAQ = [
  { question: '¿Credara concede préstamos?', answer: 'No. Comparamos ofertas de entidades reguladas; el préstamo lo concede la entidad que elijas.' },
  { question: '¿Cuánto cuesta usar el comparador?', answer: 'Nada. El servicio es gratuito para el usuario.' },
  { question: '¿Qué requisitos necesito?', answer: 'Ser mayor de edad, residir en España con DNI o NIE, tener una cuenta bancaria a tu nombre, móvil y correo.' },
  { question: '¿Puedo pedir con ASNEF?', answer: 'Algunas entidades estudian solicitudes con ASNEF. Las marcamos en el comparador.' },
  { question: '¿Cuándo recibo el dinero?', answer: 'Desde 15 minutos hasta 24 horas, según la entidad y tu banco.' },
];

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, DecimalPipe, RouterLink, LoadingState],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnDestroy {
  private readonly lenders = inject(LendersService);
  private readonly store = inject(LoanSimulationStore);
  private readonly document = inject(DOCUMENT);
  private readonly faqScript: HTMLScriptElement;

  protected readonly amount = signal(300);
  protected readonly termDays = signal(30);
  protected readonly calculation = computed(() => calculateLoan(this.amount(), this.termDays()));
  protected readonly responseTime = responseTime;
  protected readonly faq = FAQ;
  protected readonly steps = [
    { title: 'Simula', text: 'Elige importe y plazo y mira el coste al instante.' },
    { title: 'Rellena tus datos', text: 'Nombre, móvil y correo. Menos de 2 minutos.' },
    { title: 'Compara ofertas', text: 'Te mostramos solo las entidades que encajan con tu perfil.' },
    { title: 'Recibe el dinero', text: 'Completas la solicitud en la entidad elegida y recibes la transferencia.' },
  ];
  protected readonly loanTypes = [
    { title: 'Préstamos rápidos', slug: 'rapidos', text: 'Opciones para gastos imprevistos.' },
    { title: 'Préstamos sin nómina', slug: 'sin-nomina', text: 'Alternativas sin nómina fija.' },
    { title: 'Préstamos con ASNEF', slug: 'con-asnef', text: 'Entidades que estudian tu caso.' },
    { title: 'Préstamos urgentes', slug: 'urgentes', text: 'Compara respuestas rápidas.' },
    { title: 'Préstamos online', slug: 'online', text: 'Solicita desde cualquier lugar.' },
  ];
  protected readonly advantages = [
    { title: 'Gratis para ti', text: 'No cobramos nada al usuario: nos pagan las entidades.' },
    { title: 'Transparencia', text: 'Intereses, TAE y total a devolver antes de pedir.' },
    { title: 'Entidades reguladas', text: 'Solo trabajamos con entidades registradas en España.' },
    { title: 'Datos protegidos', text: 'Tratamos tus datos conforme al RGPD.' },
    { title: 'Sin compromiso', text: 'Ver ofertas no te obliga a pedir ningún préstamo.' },
    { title: 'Rápido', text: 'Ofertas en 2 minutos, desde cualquier dispositivo.' },
  ];
  protected readonly reviews = [
    { stars: '★★★★★', quote: 'Vi el coste real antes de pedir y elegí la entidad más barata.', author: 'Laura G., Valencia', loan: '400 € a 30 días' },
    { stars: '★★★★★', quote: 'En 10 minutos tenía la respuesta de la entidad.', author: 'Javier M., Sevilla', loan: '250 € a 15 días' },
    { stars: '★★★★☆', quote: 'Me ayudó a entender la TAE antes de decidir.', author: 'Carmen R., Bilbao', loan: '800 € a 60 días' },
  ];

  private readonly reloadCount = signal(0);
  protected readonly offersState = toSignal(
    toObservable(this.reloadCount).pipe(switchMap(() => toLoadState(this.lenders.listLenders(undefined, true)))),
    { initialValue: { status: 'loading' } as LoadState<Page<Lender>> },
  );

  constructor() {
    this.faqScript = this.document.createElement('script');
    this.faqScript.type = 'application/ld+json';
    this.faqScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({
        '@type': 'Question', name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
    this.document.head.appendChild(this.faqScript);
  }

  ngOnDestroy(): void {
    this.faqScript.remove();
  }

  protected setAmount(value: string): void {
    const amount = Number(value);
    if (Number.isInteger(amount) && amount >= 50 && amount <= 2000) {
      this.amount.set(amount);
      this.store.save(amount, this.termDays());
    }
  }

  protected setTerm(value: string): void {
    const days = Number(value);
    if (Number.isInteger(days) && days >= 7 && days <= 90) {
      this.termDays.set(days);
      this.store.save(this.amount(), days);
    }
  }

  protected scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
