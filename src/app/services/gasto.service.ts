import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface GastoResponse {
  message: string;
  data: any[];
}

@Injectable({
  providedIn: 'root',
})

export class GastoService {
  private apiUrl = 'http://localhost:8000/api/gastos';
  constructor(private http: HttpClient) {}

  guardarGasto(gasto: any): Observable<any> {
    return this.http.post(this.apiUrl, gasto);
  }

  obtenerGastos(): Observable<GastoResponse> {
    return this.http.get<GastoResponse>(this.apiUrl);
  }

  eliminarGasto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerGasto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  actualizarGasto(id: number, gasto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, gasto);
  }


}
