import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Gasto {
  id?: number;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
}

interface GastoResponse {
  message: string;
  data: Gasto[];
}

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = `${environment.apiUrl}/gastos`;

  constructor(private http: HttpClient) { }

  guardarGasto(gasto: Gasto): Observable<Gasto> {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }

  obtenerGastos(filtro?: { mes?: number; anio?: number }): Observable<GastoResponse> {
  let params = new HttpParams();
  if (filtro?.mes)  params = params.set('mes', filtro.mes);
  if (filtro?.anio) params = params.set('anio', filtro.anio);
  return this.http.get<GastoResponse>(this.apiUrl, { params });
}

  eliminarGasto(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`);
  }

  obtenerGasto(id: number): Observable<{ data: Gasto }> {
    return this.http.get<{ data: Gasto }>(`${this.apiUrl}/${id}`);
  }

  actualizarGasto(id: number, gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${id}`, gasto);
  }
}
