import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { calculateLoan } from '../../../../common/loan-calculation';
import { SimulationState } from '../../../../common/simulation-state';
import { LoadState } from '../../../../shared/models/load-state';
import { Page } from '../../../../shared/models/page';
import { toLoadState } from '../../../../shared/utils/to-load-state';
import { LendersService } from '../../data-access/lenders.service';
import { Lender } from '../../models/lenders.models';

const FAQ = [
  { question: '¿Credara concede préstamos?', answer: 'No. Comparamos ofertas de entidades reguladas; el préstamo lo concede la entidad que elijas.' },
  { question: '¿Cuánto cuesta usar el comparador?', answer: 'Nada. El servicio es gratuito para el usuario.' },
  { question: '¿Qué requisitos necesito?', answer: 'Ser mayor de edad, residir en España con DNI o NIE, tener una cuenta bancaria a tu nombre, móvil y correo.' },
  { question: '¿Puedo pedir con ASNEF?', answer: 'Algunas entidades estudian solicitudes con ASNEF. Las marcamos en el comparador.' },
  { question: '¿Cuándo recibo el dinero?', answer: 'Desde 15 minutos hasta 24 horas, según la entidad y tu banco.' },
];

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly simulation = inject(SimulationState);
  private readonly lenders = inject(LendersService);
  protected readonly amount = signal(300);
  protected readonly days = signal(30);
  protected readonly calculation = computed(() => calculateLoan(this.amount(), this.days()));
  protected readonly faq = FAQ;
  protected readonly steps = [
    { title: 'Simula', text: 'Elige importe y plazo y mira el coste al instante.' },
    { title: 'Rellena tus datos', text: 'Nombre, móvil y correo. Menos de 2 minutos.' },
    { title: 'Compara ofertas', text: 'Te mostramos solo las entidades que encajan con tu perfil.' },
    { title: 'Recibe el dinero', text: 'Completas la solicitud en la entidad elegida y recibes la transferencia.' },
  ];
  protected readonly types = [
    { title: 'Préstamos rápidos', slug: 'rapidos' }, { title: 'Préstamos sin nómina', slug: 'sin-nomina' },
    { title: 'Préstamos con ASNEF', slug: 'con-asnef' }, { title: 'Préstamos urgentes', slug: 'urgentes' },
    { title: 'Préstamos online', slug: 'online' },
  ];
  protected readonly benefits = [
    { title: 'Gratis para ti', text: 'No cobramos nada al usuario: nos pagan las entidades.' },
    { title: 'Transparencia', text: 'Intereses, TAE y total a devolver antes de pedir.' },
    { title: 'Entidades reguladas', text: 'Solo trabajamos con entidades registradas en España.' },
    { title: 'Datos protegidos', text: 'Tratamos tus datos conforme al RGPD.' },
    { title: 'Sin compromiso', text: 'Ver ofertas no te obliga a pedir ningún préstamo.' },
    { title: 'Rápido', text: 'Ofertas en minutos, desde cualquier dispositivo.' },
  ];
  protected readonly reviews = [
    { stars: '★★★★★', quote: 'Vi el coste real antes de pedir y elegí la entidad más barata.', name: 'Laura G. · Valencia · 400 € a 30 días' },
    { stars: '★★★★★', quote: 'En 10 minutos tenía la respuesta de la entidad.', name: 'Javier M. · Sevilla · 250 € a 15 días' },
    { stars: '★★★★☆', quote: 'Me ayudó a entender la TAE antes de decidir.', name: 'Carmen R. · Bilbao · 800 € a 60 días' },
  ];
  private readonly reloadCount = signal(0);
  protected readonly offersState = toSignal(toObservable(this.reloadCount).pipe(
    switchMap(() => toLoadState(this.lenders.listLenders({ sort: 'recommended', featured: true, page: 0, size: 3 }))),
  ), { initialValue: { status: 'loading' } as LoadState<Page<Lender>> });
  protected readonly faqJson = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });

  protected setAmount(value: string): void {
    const amount = Number(value);
    if (Number.isInteger(amount) && amount >= 50 && amount <= 2000 && amount % 50 === 0) this.save(amount, this.days());
  }

  protected setDays(value: string): void {
    const days = Number(value);
    if (Number.isInteger(days) && days >= 7 && days <= 90) this.save(this.amount(), days);
  }

  private save(amount: number, days: number): void {
    this.amount.set(amount);
    this.days.set(days);
    this.simulation.updateSelection(amount, days);
  }

  protected responseTime(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${Number((minutes / 60).toFixed(1)).toString().replace('.', ',')} h`;
  }

  protected scrollToSimulator(): void {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
