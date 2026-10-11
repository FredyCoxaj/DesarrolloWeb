import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Api } from './api';
import { AuthResponseDto, LoginDto, RegisterDto, User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'rutabus_token';
const REFRESH_KEY = 'rutabus_refresh';
const USER_KEY = 'rutabus_user';

@Injectable({ providedIn: 'root' })
export class Auth {
  private api = inject(Api);
  private router = inject(Router);

  currentUser = signal<User | null>(this.loadUserFromStorage());

  login(dto: LoginDto) {
    return this.api.post<AuthResponseDto>('/auth/login', dto).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  register(dto: RegisterDto) {
    return this.api.post<AuthResponseDto>('/auth/register', dto).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.rol === role;
  }

  switchRole(role: UserRole) {
    const current = this.currentUser() || {
      id: 'usr-1',
      dpi: '2541893200101',
      nombre: 'Renato Usuario',
      email: 'renato@rutabus.gt',
      rol: role,
      dpiVerificado: true,
    };
    const updated: User = { ...current, rol: role };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    if (!this.getToken()) {
      localStorage.setItem(TOKEN_KEY, 'mock-jwt-token-track-c');
    }
    this.currentUser.set(updated);
  }

  private saveSession(res: AuthResponseDto) {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
    // En entorno de desarrollo por defecto proveer usuario inicial verificado
    return {
      id: 'usr-1',
      dpi: '2541893200101',
      nombre: 'Renato (Dev)',
      email: 'renato@rutabus.gt',
      rol: 'CHOFER',
      dpiVerificado: true,
    };
  }
}