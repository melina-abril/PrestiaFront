import { Injectable, signal } from '@angular/core';

export interface SimulationSelection {
  amount: number;
  days: number;
}

const STORAGE_KEY = 'credara.simulacion';

function isValidSelection(value: unknown): value is SimulationSelection {
  if (typeof value !== 'object' || value === null || !('amount' in value) || !('days' in value)) {
    return false;
  }
  return typeof value.amount === 'number'
    && Number.isFinite(value.amount)
    && value.amount >= 50
    && value.amount <= 2000
    && typeof value.days === 'number'
    && Number.isInteger(value.days)
    && value.days >= 7
    && value.days <= 90;
}

function readSelection(): SimulationSelection | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(stored);
    return isValidSelection(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SimulationState {
  readonly selection = signal<SimulationSelection | null>(readSelection());

  getSelection(defaultAmount: number, defaultDays: number): SimulationSelection {
    const defaults: SimulationSelection = { amount: defaultAmount, days: defaultDays };
    if (!isValidSelection(defaults)) {
      throw new RangeError('Los valores predeterminados de la simulación no son válidos.');
    }
    return this.selection() ?? defaults;
  }

  updateSelection(amount: number, days: number): void {
    const next: SimulationSelection = { amount, days };
    if (!isValidSelection(next)) {
      throw new RangeError('El importe o el plazo de la simulación no son válidos.');
    }
    this.selection.set(next);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // La simulación sigue disponible durante la visita aunque el navegador bloquee el almacenamiento.
    }
  }
}
