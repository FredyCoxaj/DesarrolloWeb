import { Component, inject, signal, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GpsService } from '../../../core/services/gps.service';
import { GpsPosition } from '../../../core/models';

@Component({
  selector: 'app-admin-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class AdminMapa implements AfterViewInit, OnDestroy {
  private gps = inject(GpsService);

  readonly allBuses = this.gps.buses;
  readonly alerts = this.gps.alerts;

  // Filtros
  selectedRouteFilter = signal<string>('TODAS');
  selectedStatusFilter = signal<string>('TODOS');
  selectedBus = signal<GpsPosition | null>(null);

  filteredBuses = computed(() => {
    const route = this.selectedRouteFilter();
    const status = this.selectedStatusFilter();

    return this.allBuses().filter((bus) => {
      if (route !== 'TODAS' && bus.rutaId !== route) return false;
      if (status !== 'TODOS' && bus.estado !== status) return false;
      return true;
    });
  });

  private map: any = null;
  private markersMap = new Map<string, any>();
  private updateInterval: any = null;

  ngAfterViewInit() {
    this.initGlobalMap();
  }

  ngOnDestroy() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.map) {
      try {
        this.map.remove();
      } catch {
        // cleanup safe
      }
    }
  }

  private initGlobalMap() {
    import('leaflet').then((L) => {
      const leaflet = (L as any).default || L;
      const container = document.getElementById('admin-global-map');
      if (!container) return;

      // Centro geográfico entre Amatitlán y Villa Nueva
      this.map = leaflet.map('admin-global-map', {
        center: [14.5050, -90.6000],
        zoom: 12,
        zoomControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap · RutaBus GT Telemetría',
        maxZoom: 19,
      }).addTo(this.map);

      // Dibujar polilíneas de calles generadas por Dijkstra
      this.drawAdminRoutes(leaflet);

      // Renderizar marcadores iniciales
      this.syncMarkers(leaflet);

      // Actualizar marcadores continuamente cada 3s sin reconstruir mapa (F2 / F10)
      this.updateInterval = setInterval(() => {
        this.syncMarkers(leaflet);
        this.updateRouteVisibility();
      }, 3000);
    });
  }

  private adminRoutePolylines = new Map<string, any>();

  private drawAdminRoutes(L: any) {
    if (!this.map) return;

    const routesConfig = [
      { id: 'r1', color: '#1E3A8A', name: 'Amatitlán → Villa Nueva' },
      { id: 'r2', color: '#059669', name: 'Villa Nueva → Zona 12' },
      { id: 'r3', color: '#7C3AED', name: 'Amatitlán → Mixco' },
      { id: 'r4', color: '#D97706', name: 'Amatitlán → San Miguel Petapa' },
    ];

    routesConfig.forEach((r) => {
      const coords = this.gps.getRouteStreetPolyline(r.id);
      if (coords && coords.length > 0) {
        const poly = L.polyline(coords, {
          color: r.color,
          weight: 4,
          opacity: 0.6,
        }).addTo(this.map).bindTooltip(`Ruta: ${r.name}`, { sticky: true });

        this.adminRoutePolylines.set(r.id, poly);
      }
    });
  }

  private updateRouteVisibility() {
    const filter = this.selectedRouteFilter();
    this.adminRoutePolylines.forEach((poly, id) => {
      if (filter === 'TODAS' || filter === id) {
        poly.setStyle({ opacity: filter === id ? 0.9 : 0.6, weight: filter === id ? 6 : 4 });
      } else {
        poly.setStyle({ opacity: 0.15, weight: 2 });
      }
    });
  }

  private syncMarkers(L: any) {

    if (!this.map) return;

    const buses = this.filteredBuses();

    buses.forEach((bus) => {
      const isDetenido = bus.estado === 'DETENIDO';
      const isSelected = this.selectedBus()?.busId === bus.busId;

      const bgColor = isDetenido ? '#EF4444' : isSelected ? '#1E3A8A' : '#3B82F6';
      const pulseClass = isDetenido ? 'animate-ping' : '';

      const iconHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          ${isDetenido ? `<span style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.5);" class="${pulseClass}"></span>` : ''}
          <div style="background:${bgColor};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:17px;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);position:relative;z-index:2;">
            🚌
          </div>
          <div style="position:absolute;top:-18px;background:#FFFFFF;color:#1E3A8A;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:4px;border:1px solid #CBD5E1;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap;z-index:3;">
            ${bus.placa}
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        className: 'admin-bus-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      let marker = this.markersMap.get(bus.busId);
      if (marker) {
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(divIcon);
      } else {
        marker = L.marker([bus.lat, bus.lng], { icon: divIcon })
          .addTo(this.map)
          .on('click', () => {
            this.selectedBus.set(bus);
          });
        this.markersMap.set(bus.busId, marker);
      }
    });
  }

  focusBus(bus: GpsPosition) {
    this.selectedBus.set(bus);
    if (this.map) {
      this.map.setView([bus.lat, bus.lng], 15);
    }
  }

  closeDrawer() {
    this.selectedBus.set(null);
  }
}
