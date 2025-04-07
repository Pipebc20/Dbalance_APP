import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface IngresoResponse {
  message: string;
  data: any[];
}

@Injectable({
  providedIn: 'root',
})

export class IngresoService {
  private apiUrl = 'http://localhost:8000/api/ingresos';

  constructor(private http: HttpClient) {}

  guardarIngreso(ingreso: any): Observable<any> {
    return this.http.post(this.apiUrl, ingreso);
  }

  obtenerIngresos(): Observable<IngresoResponse> {
    return this.http.get<IngresoResponse>(this.apiUrl);
  }

  eliminarIngreso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerIngreso(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  actualizarIngreso(id: number, ingreso: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, ingreso);
  }
}
