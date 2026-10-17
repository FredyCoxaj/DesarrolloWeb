import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsService } from '../../../core/services/notifications';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss'
})
export class BottomNav {
  private notificationsService = inject(NotificationsService);

  items = [
    { label: 'Mapa',   icon: '🗺',  path: '/pasajero/mapa' },
    { label: 'Rutas',  icon: '🚌',  path: '/pasajero/rutas' },
    { label: 'Boletos',icon: '🎫',  path: '/pasajero/boletos' },
    { label: 'Avisos', icon: '🔔',  path: '/pasajero/avisos' },
    { label: 'Perfil', icon: '👤',  path: '/pasajero/perfil' },
  ];

  get unreadCount(): number {
    return this.notificationsService.unreadCount();
  }
}