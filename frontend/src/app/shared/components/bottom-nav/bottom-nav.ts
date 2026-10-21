import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsService } from '../../../core/services/notifications';

interface NavItem {
  label: string;
  iconPath: string;
  path: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss'
})
export class BottomNav {
  private notificationsService = inject(NotificationsService);

  items: NavItem[] = [
    { label: 'Mapa',    iconPath: '/icons/map.svg',    path: '/pasajero/mapa' },
    { label: 'Rutas',   iconPath: '/icons/bus.svg',    path: '/pasajero/rutas' },
    { label: 'Boletos', iconPath: '/icons/ticket.svg', path: '/pasajero/boletos' },
    { label: 'Avisos',  iconPath: '/icons/bell.svg',   path: '/pasajero/avisos' },
    { label: 'Perfil',  iconPath: '/icons/user.svg',   path: '/pasajero/perfil' },
  ];

  get unreadCount(): number {
    return this.notificationsService.unreadCount();
  }
}