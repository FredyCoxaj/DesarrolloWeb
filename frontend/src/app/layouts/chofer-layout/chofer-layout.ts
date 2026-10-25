import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GpsService } from '../../core/services/gps.service';
import { ChoferService } from '../../core/services/chofer.service';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-chofer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './chofer-layout.html',
  styleUrl: './chofer-layout.scss',
})
export class ChoferLayout {
  private gps = inject(GpsService);
  private choferService = inject(ChoferService);
  private auth = inject(Auth);

  readonly chofer = this.choferService.choferProfile;
  readonly activeTrip = this.choferService.activeTrip;
  readonly isGpsConnected = this.gps.isConnected;

  navItems = [
    { label: 'Viaje Activo', icon: '🚍', path: '/chofer/viaje-activo' },
    { label: 'Cobros / Ganancias', icon: '💵', path: '/chofer/ganancias' },
    { label: 'Historial', icon: '📋', path: '/chofer/historial' },
    { label: 'Mi Perfil', icon: '👨‍✈️', path: '/chofer/perfil' },
  ];

  logout() {
    this.auth.logout();
  }
}
