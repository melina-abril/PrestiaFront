import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type AnswerKey = 'timing' | 'amount' | 'payslip' | 'asnef';

type Answers = Record<AnswerKey, string | null>;

interface Question {
  key: AnswerKey;
  shortLabel: string;
  title: string;
  description: string;
  options: readonly string[];
}

interface Recommendation {
  slug: string;
  title: string;
  reason: string;
}

const QUESTIONS: readonly Question[] = [
  {
    key: 'timing',
    shortLabel: 'Cuándo',
    title: '¿Para cuándo necesitas el dinero?',
    description: 'Elige cuándo te gustaría disponer del importe.',
    options: ['Hoy mismo', 'Esta semana', 'No tengo prisa'],
  },
  {
    key: 'amount',
    shortLabel: 'Cuánto',
    title: '¿Cuánto dinero necesitas?',
    description: 'Selecciona el rango que mejor se ajuste a lo que buscas.',
    options: ['Hasta 300 €', 'De 301 € a 1.000 €', 'De 1.001 € a 2.000 €'],
  },
  {
    key: 'payslip',
    shortLabel: 'Nómina',
    title: '¿Tienes nómina?',
    description: 'Tu situación laboral ayuda a orientar la recomendación.',
    options: ['Sí', 'No'],
  },
  {
    key: 'asnef',
    shortLabel: 'ASNEF',
    title: '¿Estás en ASNEF?',
    description: 'Indícanos si figuras en algún fichero de morosidad.',
    options: ['No', 'Sí', 'No lo sé'],
  },
];

const INITIAL_ANSWERS: Answers = {
  timing: null,
  amount: null,
  payslip: null,
  asnef: null,
};

@Component({
  selector: 'app-loan-test-page',
  imports: [RouterLink],
  templateUrl: './loan-test-page.html',
  styleUrl: './loan-test-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanTestPage {
  protected readonly questions = QUESTIONS;
  protected readonly step = signal(0);
  protected readonly answers = signal<Answers>({ ...INITIAL_ANSWERS });
  protected readonly showingResult = signal(false);
  protected readonly question = computed(() => QUESTIONS[this.step()]);
  protected readonly selected = computed(() => this.answers()[this.question().key]);
  protected readonly answeredCount = computed(() =>
    QUESTIONS.filter((question) => this.answers()[question.key] !== null).length,
  );
  protected readonly recommendation = computed<Recommendation | null>(() => {
    const { timing, amount, payslip, asnef } = this.answers();
    if (timing === null || amount === null || payslip === null || asnef === null) return null;

    const context = `Necesitas ${amount.toLowerCase()}, ${timing.toLowerCase()} y ${payslip === 'Sí' ? 'tienes nómina' : 'no tienes nómina'}`;
    if (asnef === 'Sí') {
      return { slug: 'con-asnef', title: 'Préstamos con ASNEF', reason: `${context}; además, figuras en ASNEF. Por eso te orientamos hacia opciones que contemplan esta situación.` };
    }
    if (payslip === 'No') {
      return { slug: 'sin-nomina', title: 'Préstamos sin nómina', reason: `${context}. Por eso te orientamos hacia opciones que no exigen nómina.` };
    }
    if (timing === 'Hoy mismo') {
      return { slug: 'urgentes', title: 'Préstamos urgentes', reason: `${context}. La rapidez es el criterio que más influye en esta recomendación.` };
    }
    if (amount === 'Hasta 300 €') {
      return { slug: 'rapidos', title: 'Préstamos rápidos', reason: `${context}. El importe reducido orienta la recomendación hacia préstamos rápidos.` };
    }
    return { slug: 'online', title: 'Préstamos online', reason: `${context}. Según tus respuestas, puedes empezar por los préstamos online.` };
  });

  protected choose(option: string): void {
    const question = this.question();
    if (!question.options.includes(option)) return;
    this.answers.update((current) => ({ ...current, [question.key]: option }));
  }

  protected previous(): void {
    this.step.update((current) => Math.max(0, current - 1));
  }

  protected next(): void {
    if (this.selected() === null) return;
    if (this.step() === QUESTIONS.length - 1) {
      if (this.recommendation() !== null) this.showingResult.set(true);
      return;
    }
    this.step.update((current) => current + 1);
  }

  protected restart(): void {
    this.answers.set({ ...INITIAL_ANSWERS });
    this.step.set(0);
    this.showingResult.set(false);
  }
}
