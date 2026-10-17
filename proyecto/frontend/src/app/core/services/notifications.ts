import { Injectable, signal } from '@angular/core';
import { AppNotification } from '../models';

const STORAGE_KEY = 'rutabus_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  notifications = signal<AppNotification[]>(this.loadFromStorage());

  constructor() {
    // Si no hay ninguna, carga datos mock para que se vea la pantalla
    if (this.notifications().length === 0) {
      this.seed();
    }
  }

  getAll() {
    return this.notifications();
  }

  markAsRead(id: string) {
    const updated = this.notifications().map((n) =>
      n.id === id ? { ...n, leida: true } : n
    );
    this.notifications.set(updated);
    this.save();
  }

  markAllAsRead() {
    const updated = this.notifications().map((n) => ({ ...n, leida: true }));
    this.notifications.set(updated);
    this.save();
  }

  unreadCount(): number {
    return this.notifications().filter((n) => !n.leida).length;
  }

  private seed() {
    const now = Date.now();
    const mock: AppNotification[] = [
      {
        id: 'n1',
        titulo: 'Tu bus llega en 5 min',
        mensaje: 'Bus M-101ABC en ruta Amatitlán → Villa Nueva. Asiento #12 reservado.',
        leida: false,
        fecha: new Date(now - 2 * 60 * 1000).toISOString(),
      },
      {
        id: 'n2',
        titulo: 'Retraso en ruta',
        mensaje: 'Tráfico en Calzada Aguilar Batres. ETA ajustado +10 min.',
        leida: false,
        fecha: new Date(now - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'n3',
        titulo: 'Reserva confirmada',
        mensaje: 'Tu ticket TKT-XXXX fue confirmado. Muestra el QR al abordar.',
        leida: true,
        fecha: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'n4',
        titulo: 'Cambio de tarifa',
        mensaje: 'A partir del lunes, la ruta Amatitlán → Mixco tendrá nuevo precio: Q10.00.',
        leida: true,
        fecha: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    this.notifications.set(mock);
    this.save();
  }

  private loadFromStorage(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications()));
  }
}