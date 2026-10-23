import { Component, AfterViewInit, OnDestroy, signal, inject } from '@angular/core';
import { GpsService } from '../../../../core/services/gps.service';
import { GpsPosition } from '../../../../core/models';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa implements AfterViewInit, OnDestroy {
  private gps = inject(GpsService);
  private map: any;
  private markersMap = new Map<string, any>();
  private updateInterval: any = null;

  // Buses reactivos desde el GpsService de Renato (Track C)
  buses = this.gps.buses;
  selectedBus = signal<GpsPosition | null>(null);

  ngAfterViewInit() {
    // Importar Leaflet dinámicamente para evitar problemas con SSR
    import('leaflet').then((L) => {
      const leaflet = (L as any).default || L;

      // Centro del mapa en Amatitlán
      this.map = leaflet.map('map', {
        center: [14.4769, -90.6347],
        zoom: 13,
        zoomControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap · Telemetría en Vivo',
        maxZoom: 19,
      }).addTo(this.map);

      // Ubicación del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;

          leaflet.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3B82F6',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
          }).addTo(this.map).bindPopup('Tu ubicación');

          this.map.setView([latitude, longitude], 14);
        });
      }

      // Dibujar rutas viales generadas por Dijkstra en el mapa
      this.drawRoutePolylines(leaflet);

      // Agregar y sincronizar marcadores de buses en vivo
      this.syncBusMarkers(leaflet);

      // Actualizar periódicamente sin destruir el mapa (F2)
      this.updateInterval = setInterval(() => {
        this.syncBusMarkers(leaflet);
      }, 3000);
    });
  }

  private routePolylines = new Map<string, any>();

  private drawRoutePolylines(L: any) {
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
          opacity: 0.65,
          smoothFactor: 1,
        }).addTo(this.map).bindTooltip(`Ruta: ${r.name}`, { sticky: true });

        this.routePolylines.set(r.id, poly);
      }
    });
  }

  ngOnDestroy() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.map) {
      try {
        this.map.remove();
      } catch {
        // safe cleanup
      }
    }
  }

  private syncBusMarkers(L: any) {
    if (!this.map) return;

    this.buses().forEach((bus) => {
      const isSelected = this.selectedBus()?.busId === bus.busId;
      const markerColor = isSelected ? '#10B981' : '#1E3A8A';

      const icon = L.divIcon({
        className: 'bus-marker',
        html: `<div style="background:${markerColor};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);transition:all 0.3s">🚌</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      let marker = this.markersMap.get(bus.busId);
      if (marker) {
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(icon);
      } else {
        marker = L.marker([bus.lat, bus.lng], { icon })
          .addTo(this.map)
          .on('click', () => {
            this.selectedBus.set(bus);
            this.highlightRoute(bus.rutaId);
          });
        this.markersMap.set(bus.busId, marker);
      }
    });
  }

  private highlightRoute(rutaId: string) {
    this.routePolylines.forEach((poly, id) => {
      if (id === rutaId) {
        poly.setStyle({ weight: 6, opacity: 0.95 });
        poly.bringToFront();
      } else {
        poly.setStyle({ weight: 3, opacity: 0.3 });
      }
    });
  }

  cerrarDetalle() {
    this.selectedBus.set(null);
    this.routePolylines.forEach((poly) => {
      poly.setStyle({ weight: 4, opacity: 0.65 });
    });
  }
}