import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'environment.apiUrl';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /* ========== MÉTODOS DE AUTENTICACIÓN ========== */
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_id', response.user?.id?.toString() || '');
          this.userSubject.next(response.user || null);
          if (response.redirect) {
            this.router.navigate([response.redirect]);
          }
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      }),
      catchError((error) => {
        console.error('Error en register:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<{ token: string; user: any; redirect?: string }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: { token: string; user: any; redirect?: string }) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_id', response.user?.id?.toString() || '');
          this.userSubject.next(response.user || null);
          if (response.redirect) {
            this.router.navigate([response.redirect]);
          }
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, null, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error('Error al cerrar sesión:', error);
        this.clearAuth();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
}

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getAuthHeaders() }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/email`, { email });
  }

  /* ========== MÉTODOS AUXILIARES ========== */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const user = this.userSubject.value;
    if (user && user.id) {
      return user.id;
    }
    const userId = localStorage.getItem('user_id');
    return userId ? Number(userId) : null;
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    this.userSubject.next(null);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
