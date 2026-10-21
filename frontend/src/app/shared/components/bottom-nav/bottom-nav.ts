import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationsService } from '../../../core/services/notifications';
import { LucideMap, LucideBus, LucideTicket, LucideBell, LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideMap, LucideBus, LucideTicket, LucideBell, LucideUser],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss'
})
export class BottomNav {
  private notificationsService = inject(NotificationsService);

  items = [
    { label: 'Mapa',   icon: LucideMap,  path: '/pasajero/mapa' },
    { label: 'Rutas',  icon: LucideBus,  path: '/pasajero/rutas' },
    { label: 'Boletos',icon: LucideTicket,  path: '/pasajero/boletos' },
    { label: 'Avisos', icon: LucideBell,  path: '/pasajero/avisos' },
    { label: 'Perfil', icon: LucideUser,  path: '/pasajero/perfil' },
  ];

  get unreadCount(): number {
    return this.notificationsService.unreadCount();
  }
}