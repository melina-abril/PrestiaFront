import { Injectable, signal } from '@angular/core';

export interface LoanSimulation {
  readonly amount: number;
  readonly termDays: number;
}

const STORAGE_KEY = 'credara.simulacion';

function isLoanSimulation(value: unknown): value is LoanSimulation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate['amount'] === 'number'
    && Number.isFinite(candidate['amount'])
    && candidate['amount'] >= 50
    && candidate['amount'] <= 2000
    && typeof candidate['termDays'] === 'number'
    && Number.isInteger(candidate['termDays'])
    && candidate['termDays'] >= 7
    && candidate['termDays'] <= 90;
}

function readStoredSimulation(): LoanSimulation | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(stored);
    return isLoanSimulation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class LoanSimulationStore {
  private readonly state = signal<LoanSimulation | null>(readStoredSimulation());
  readonly simulation = this.state.asReadonly();

  getInitial(defaultAmount: number, defaultTermDays: number): LoanSimulation {
    const fallback: LoanSimulation = { amount: defaultAmount, termDays: defaultTermDays };
    if (!isLoanSimulation(fallback)) {
      throw new RangeError('Los valores iniciales de la simulación no son válidos.');
    }
    return this.state() ?? fallback;
  }

  save(amount: number, termDays: number): void {
    const simulation: LoanSimulation = { amount, termDays };
    if (!isLoanSimulation(simulation)) {
      throw new RangeError('El importe o el plazo de la simulación no son válidos.');
    }
    this.state.set(simulation);
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(simulation));
      } catch {
        // La simulación sigue disponible durante esta visita aunque el almacenamiento esté bloqueado.
      }
    }
  }
}
