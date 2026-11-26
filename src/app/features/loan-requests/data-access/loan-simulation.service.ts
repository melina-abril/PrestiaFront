import { Injectable } from '@angular/core';

export interface LoanSimulation {
  amount: number;
  days: number;
}

@Injectable({ providedIn: 'root' })
export class LoanSimulationService {
  private readonly storageKey = 'credara.simulacion';

  get(): LoanSimulation | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored === null) {
        return null;
      }
      const value: unknown = JSON.parse(stored);
      if (typeof value !== 'object' || value === null || !('amount' in value) || !('days' in value)) {
        return null;
      }
      const { amount, days } = value;
      if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0 ||
          typeof days !== 'number' || !Number.isInteger(days) || days < 7 || days > 90) {
        return null;
      }
      return { amount, days };
    } catch {
      return null;
    }
  }

  set(amount: number, days: number): void {
    if (!Number.isInteger(amount) || amount < 50 || amount > 2000 || amount % 50 !== 0 ||
        !Number.isInteger(days) || days < 7 || days > 90) {
      throw new RangeError('La simulación debe tener un importe y un plazo válidos.');
    }
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify({ amount, days } satisfies LoanSimulation));
    } catch {
      // El almacenamiento puede estar deshabilitado; la simulación sigue funcionando.
    }
  }
}
