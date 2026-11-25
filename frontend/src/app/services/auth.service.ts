import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario, LoginResponse, RegisterRequest } from '../models/usuario.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  // Usamos 127.0.0.1 para evitar la latencia de resolucion IPv6 de localhost en Windows
  private apiUrl = 'http://127.0.0.1:8080/api/auth';

  currentUser = signal<Usuario | null>(this.getUserFromStorage());

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.guardarSesion(response);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.guardarSesion(response);
        }
      })
    );
  }

  private guardarSesion(response: LoginResponse): void {
    const user: Usuario = {
      username: response.username || '',
      nombreCompleto: response.nombreCompleto || '',
      rol: response.rol || 'BIBLIOTECARIO'
    };
    localStorage.setItem('token', response.token || '');
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserFromStorage(): Usuario | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
