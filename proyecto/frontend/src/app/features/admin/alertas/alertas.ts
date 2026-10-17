import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsService } from '../../../core/services/gps.service';
import { AdminService } from '../../../core/services/admin.service';
import { AdminAlert, Incident } from '../../../core/models';

@Component({
  selector: 'app-admin-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss',
})
export class AdminAlertas {
  private gps = inject(GpsService);
  private admin = inject(AdminService);

  readonly alerts = this.gps.alerts;
  readonly incidents = this.gps.incidents;

  filterTab = signal<'ALERTAS' | 'INCIDENCIAS'>('ALERTAS');
  onlyUnread = signal<boolean>(false);

  filteredAlerts = computed(() => {
    let list = this.alerts();
    if (this.onlyUnread()) {
      list = list.filter((a) => !a.leida);
    }
    return list;
  });

  markAsRead(alert: AdminAlert) {
    this.gps.markAlertAsRead(alert.id);
  }

  resolveAlert(alert: AdminAlert) {
    this.gps.resolveAlert(alert.id);
  }

  resolveIncident(incident: Incident) {
    this.gps.markIncidentAsResolved(incident.id);
  }
}
