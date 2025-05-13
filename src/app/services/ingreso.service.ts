import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { formatDate } from '@angular/common';

interface Ingreso {
  categoria: boolean;
  id?: number;
  monto: number;
  descripcion: string;
  fecha: string;
  fuente: string;
}

interface IngresoResponse {
  message: string;
  data: Ingreso[];
}

@Injectable({
  providedIn: 'root'
})
export class IngresoService {
  private apiUrl = `${environment.apiUrl}/ingresos`;

  constructor(private http: HttpClient) { }

  private normalizarFecha(fecha: string | Date): string {
    // Si ya está en formato correcto, retornar directamente
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    try {
      // Convertir formatos como "1,504/2025" a "2025-04-01"
      if (typeof fecha === 'string' && fecha.includes(',')) {
        const [dia, mesAnio] = fecha.split(',');
        const [mes, anio] = mesAnio.split('/');
        return `${anio.trim()}-${mes.trim().padStart(2, '0')}-${dia.trim().padStart(2, '0')}`;
      }

      // Formatear cualquier otra fecha válida
      return formatDate(fecha, 'yyyy-MM-dd', 'en-US');
    } catch (e) {
      console.error('Error al normalizar fecha, usando fecha actual:', e);
      return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    }
  }

  guardarIngreso(ingreso: Ingreso): Observable<Ingreso> {
    const ingresoNormalizado = {
      ...ingreso,
      fecha: this.normalizarFecha(ingreso.fecha)
    };
    return this.http.post<Ingreso>(this.apiUrl, ingresoNormalizado);
  }

  obtenerIngresos(): Observable<IngresoResponse> {
    return this.http.get<IngresoResponse>(this.apiUrl);
  }

  eliminarIngreso(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`);
  }

  obtenerIngreso(id: number): Observable<{ data: Ingreso }> {
    return this.http.get<{ data: Ingreso }>(`${this.apiUrl}/${id}`);
  }

  actualizarIngreso(id: number, ingreso: Partial<Ingreso>): Observable<Ingreso> {
    const ingresoNormalizado = {
      ...ingreso,
      fecha: ingreso.fecha ? this.normalizarFecha(ingreso.fecha) : undefined
    };
    return this.http.put<Ingreso>(`${this.apiUrl}/${id}`, ingresoNormalizado);
  }
}
