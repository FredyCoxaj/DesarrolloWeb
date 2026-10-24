import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Api } from './api';
import { AuthResponseDto, LoginDto, RegisterDto, User, UserRole } from '../models';

const TOKEN_KEY = 'rutabus_token';
//const REFRESH_KEY = 'rutabus_refresh';
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
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, rol: role };
    this.currentUser.set(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    // Redirigir según el nuevo rol
    if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else if (role === 'CHOFER') this.router.navigate(['/chofer/viaje-activo']);
    else this.router.navigate(['/pasajero/mapa']);
  }

  private saveSession(res: AuthResponseDto) {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}