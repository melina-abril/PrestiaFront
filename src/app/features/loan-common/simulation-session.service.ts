import { Injectable } from '@angular/core';

export interface SimulationSelection {
  amount: number;
  termDays: number;
}

@Injectable({ providedIn: 'root' })
export class SimulationSession {
  readonly homeDefaults: SimulationSelection = { amount: 300, termDays: 30 };
  readonly advancedDefaults: SimulationSelection = { amount: 500, termDays: 30 };

  private readonly storageKey = 'credara.simulacion';

  load(defaults: SimulationSelection): SimulationSelection {
    if (typeof sessionStorage === 'undefined') {
      return { ...defaults };
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored === null) {
        return { ...defaults };
      }
      const value: unknown = JSON.parse(stored);
      if (this.isSelection(value)) {
        return { amount: value.amount, termDays: value.termDays };
      }
    } catch {
      // El almacenamiento puede estar deshabilitado o contener datos inválidos.
    }
    return { ...defaults };
  }

  save(amount: number, termDays: number): void {
    const selection: SimulationSelection = { amount, termDays };
    if (!this.isSelection(selection)) {
      throw new RangeError('Selecciona un importe y un plazo válidos.');
    }
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(selection));
    } catch {
      // La simulación sigue funcionando si el navegador bloquea el almacenamiento.
    }
  }

  private isSelection(value: unknown): value is SimulationSelection {
    if (typeof value !== 'object' || value === null || !('amount' in value) || !('termDays' in value)) {
      return false;
    }
    return typeof value.amount === 'number'
      && Number.isFinite(value.amount)
      && value.amount >= 50
      && value.amount <= 2000
      && typeof value.termDays === 'number'
      && Number.isInteger(value.termDays)
      && value.termDays >= 7
      && value.termDays <= 90;
  }
}
