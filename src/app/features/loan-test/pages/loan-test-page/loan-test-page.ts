import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type QuestionKey = 'timing' | 'amount' | 'payroll' | 'asnef';
type AnswerValue = 'today' | 'week' | 'later' | 'small' | 'medium' | 'large' | 'yes' | 'no' | 'unknown';

interface Option {
  readonly value: AnswerValue;
  readonly label: string;
}

interface Question {
  readonly key: QuestionKey;
  readonly shortLabel: string;
  readonly summaryLabel: string;
  readonly title: string;
  readonly hint: string;
  readonly options: readonly Option[];
}

type Answers = Record<QuestionKey, AnswerValue | null>;

interface Recommendation {
  readonly title: string;
  readonly slug: string;
  readonly reason: string;
}

const QUESTIONS: readonly Question[] = [
  {
    key: 'timing', shortLabel: 'Cuándo', summaryLabel: '¿Para cuándo?',
    title: '¿Para cuándo necesitas el dinero?', hint: 'Elige cuándo te gustaría disponer del importe.',
    options: [
      { value: 'today', label: 'Hoy mismo' },
      { value: 'week', label: 'Esta semana' },
      { value: 'later', label: 'No tengo prisa' },
    ],
  },
  {
    key: 'amount', shortLabel: 'Cuánto', summaryLabel: '¿Cuánto?',
    title: '¿Cuánto dinero necesitas?', hint: 'Selecciona el tramo que mejor se ajuste a lo que buscas.',
    options: [
      { value: 'small', label: 'Hasta 300 €' },
      { value: 'medium', label: 'De 301 € a 1.000 €' },
      { value: 'large', label: 'De 1.001 € a 2.000 €' },
    ],
  },
  {
    key: 'payroll', shortLabel: 'Nómina', summaryLabel: '¿Tienes nómina?',
    title: '¿Tienes nómina?', hint: 'Esto nos ayuda a orientarte hacia opciones adecuadas.',
    options: [{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }],
  },
  {
    key: 'asnef', shortLabel: 'ASNEF', summaryLabel: '¿Estás en ASNEF?',
    title: '¿Estás en ASNEF?', hint: 'Indícanos si figuras en algún fichero de morosidad.',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Sí' },
      { value: 'unknown', label: 'No lo sé' },
    ],
  },
];

const EMPTY_ANSWERS: Answers = { timing: null, amount: null, payroll: null, asnef: null };

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
  protected readonly answers = signal<Answers>({ ...EMPTY_ANSWERS });
  protected readonly finished = signal(false);
  protected readonly currentQuestion = computed((): Question => QUESTIONS[this.step()] ?? QUESTIONS[0]);
  protected readonly answeredCount = computed(() =>
    QUESTIONS.filter((question) => this.answers()[question.key] !== null).length,
  );
  protected readonly recommendation = computed((): Recommendation | null => {
    const { timing, amount, payroll, asnef } = this.answers();
    if (timing === null || amount === null || payroll === null || asnef === null) return null;
    const amountLabel = this.answerLabel(QUESTIONS[1]);
    if (asnef === 'yes') {
      return { title: 'Préstamos con ASNEF', slug: 'con-asnef', reason: `Para ${amountLabel}, como indicas que estás en ASNEF, te recomendamos consultar opciones que admiten esta situación.` };
    }
    if (payroll === 'no') {
      return { title: 'Préstamos sin nómina', slug: 'sin-nomina', reason: `Para ${amountLabel}, al no tener nómina, puedes consultar opciones que no la exigen.` };
    }
    if (timing === 'today') {
      return { title: 'Préstamos urgentes', slug: 'urgentes', reason: `Para ${amountLabel}, como necesitas el dinero hoy mismo y tienes nómina, empieza por las opciones urgentes.` };
    }
    if (amount === 'small') {
      return { title: 'Préstamos rápidos', slug: 'rapidos', reason: `Para ${amountLabel}, con nómina y sin necesitarlo hoy mismo, puedes explorar los préstamos rápidos.` };
    }
    return { title: 'Préstamos online', slug: 'online', reason: `Para ${amountLabel}, con nómina y sin urgencia inmediata, los préstamos online pueden ser un buen punto de partida.` };
  });

  protected answerLabel(question: Question): string {
    const value = this.answers()[question.key];
    return question.options.find((option) => option.value === value)?.label ?? 'Pendiente';
  }

  protected select(value: AnswerValue): void {
    const question = this.currentQuestion();
    if (!question.options.some((option) => option.value === value)) return;
    this.answers.update((answers) => ({ ...answers, [question.key]: value }));
  }

  protected previous(): void {
    this.step.update((step) => Math.max(0, step - 1));
  }

  protected next(): void {
    if (this.answers()[this.currentQuestion().key] === null) return;
    if (this.step() === QUESTIONS.length - 1) {
      this.finished.set(true);
    } else {
      this.step.update((step) => step + 1);
    }
  }

  protected restart(): void {
    this.answers.set({ ...EMPTY_ANSWERS });
    this.step.set(0);
    this.finished.set(false);
  }
}
