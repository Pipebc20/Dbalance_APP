import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Presupuesto {
  id?: number;
  categoria: string;
  monto_limite: number;
  gastado?: number;
  restante?: number;
  porcentaje?: number;
}

interface PresupuestoResponse {
  message: string;
  data: Presupuesto[];
}

interface CategoriasResponse {
  data: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {
  private apiUrl = `${environment.apiUrl}/presupuestos`;

  constructor(private http: HttpClient) { }

  obtenerPresupuestos(mes: number, anio: number): Observable<PresupuestoResponse> {
    const params = new HttpParams().set('mes', mes).set('anio', anio);
    return this.http.get<PresupuestoResponse>(this.apiUrl, { params });
  }

  obtenerCategorias(): Observable<CategoriasResponse> {
    return this.http.get<CategoriasResponse>(`${this.apiUrl}/categorias`);
  }

  guardarPresupuesto(presupuesto: Presupuesto): Observable<any> {
    return this.http.post(this.apiUrl, presupuesto);
  }

  actualizarPresupuesto(id: number, presupuesto: Presupuesto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, presupuesto);
  }

  eliminarPresupuesto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
