import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Api } from './api';
import { Ticket } from '../models';

const STORAGE_KEY = 'rutabus_tickets';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private api = inject(Api);

  // Caché local (mock). Cuando Fernanda entregue el backend, usamos la API.
  tickets = signal<Ticket[]>(this.loadFromStorage());

  getAll(): Observable<Ticket[]> {
    // Cuando el backend esté listo:
    // return this.api.get<Ticket[]>('/tickets/my-tickets');
    return of(this.tickets());
  }

  getById(id: string): Ticket | undefined {
    return this.tickets().find((t) => t.id === id);
  }

  add(ticket: Ticket) {
    const updated = [ticket, ...this.tickets()];
    this.tickets.set(updated);
    this.saveToStorage(updated);
  }

  cancel(id: string) {
    const updated = this.tickets().map((t) =>
      t.id === id ? { ...t, estado: 'CANCELADO' as const } : t
    );
    this.tickets.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): Ticket[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveToStorage(tickets: Ticket[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
}