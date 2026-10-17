import { Component, inject, signal } from '@angular/core';
import { NotificationsService } from '../../../core/services/notifications';
import { AppNotification } from '../../../core/models';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [],
  templateUrl: './avisos.html',
  styleUrl: './avisos.scss'
})
export class Avisos {
  private notificationsService = inject(NotificationsService);

  notifications = this.notificationsService.notifications;

  selectedNotification = signal<AppNotification | null>(null);

  get unreadCount(): number {
    return this.notificationsService.unreadCount();
  }

  abrir(n: AppNotification) {
    this.selectedNotification.set(n);
    if (!n.leida) {
      this.notificationsService.markAsRead(n.id);
    }
  }

  cerrarDetalle() {
    this.selectedNotification.set(null);
  }

  marcarTodas() {
    this.notificationsService.markAllAsRead();
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h} h`;
    const d = Math.floor(h / 24);
    return `Hace ${d} d`;
  }

  iconFor(titulo: string): string {
    const t = titulo.toLowerCase();
    if (t.includes('llega')) return '🚌';
    if (t.includes('retraso')) return '⏱';
    if (t.includes('reserva') || t.includes('confirm')) return '✅';
    if (t.includes('tarifa') || t.includes('precio')) return '💰';
    if (t.includes('cancel')) return '❌';
    return '🔔';
  }
}