import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Tema = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly clave = 'tema';
  private temaSubject = new BehaviorSubject<Tema>('light');

  // Para que otros componentes (por ejemplo las gráficas) reaccionen al cambio
  tema$ = this.temaSubject.asObservable();

  constructor() {
    this.iniciar();
  }

  get tema(): Tema {
    return this.temaSubject.value;
  }

  get esOscuro(): boolean {
    return this.tema === 'dark';
  }

  alternar(): void {
    this.aplicar(this.esOscuro ? 'light' : 'dark');
  }

  private iniciar(): void {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem(this.clave);
    } catch {}
    // Por defecto arranca en claro; solo cambia si el usuario lo eligió
    this.aplicar(guardado === 'dark' ? 'dark' : 'light');
  }

  private aplicar(tema: Tema): void {
    this.temaSubject.next(tema);
    document.documentElement.setAttribute('data-bs-theme', tema);
    try {
      localStorage.setItem(this.clave, tema);
    } catch {}
  }
}
