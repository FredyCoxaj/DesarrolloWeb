import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GpsService } from '../../core/services/gps.service';
import { AdminService } from '../../core/services/admin.service';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private gps = inject(GpsService);
  private admin = inject(AdminService);
  private auth = inject(Auth);

  readonly alerts = this.admin.alerts;
  readonly unreadAlertsCount = computed(
    () => this.alerts().filter((a) => !a.leida).length
  );

  sidebarOpen = true;

  navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { label: 'Mapa Global en Vivo', icon: '🗺️', path: '/admin/mapa' },
    { label: 'Gestión de Flota', icon: '🚍', path: '/admin/flota' },
    { label: 'Gestión de Choferes', icon: '👨‍✈️', path: '/admin/choferes' },
    { label: 'Reportes & Ingresos', icon: '📈', path: '/admin/reportes' },
    { label: 'Alertas en Vivo', icon: '🚨', path: '/admin/alertas', hasBadge: true },
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.auth.logout();
  }
}
