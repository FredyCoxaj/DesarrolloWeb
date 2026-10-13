import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Api } from './api';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(Api);

  getMe(): Observable<User> {
    // Cuando el backend esté listo:
    // return this.api.get<User>('/users/me');

    // Mock: lee del localStorage
    const raw = localStorage.getItem('rutabus_user');
    const user: User = raw
      ? JSON.parse(raw)
      : {
          id: 'u1',
          dpi: '1234567890101',
          nombre: 'Fredy Pérez',
          email: 'fredy@correo.com',
          telefono: '5555-1234',
          rol: 'PASAJERO',
          dpiVerificado: true,
          fechaNacimiento: '2000-05-15',
        };
    return of(user);
  }

  updateMe(data: Partial<User>): Observable<User> {
    // Cuando el backend esté listo:
    // return this.api.patch<User>('/users/me', data);

    // Mock: guarda en localStorage
    const raw = localStorage.getItem('rutabus_user');
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...data };
    localStorage.setItem('rutabus_user', JSON.stringify(updated));
    return of(updated);
  }
}