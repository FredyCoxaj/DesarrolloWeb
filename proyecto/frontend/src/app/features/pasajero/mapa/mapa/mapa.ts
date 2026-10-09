import { Component, AfterViewInit, signal } from '@angular/core';

interface BusMarker {
  id: string;
  placa: string;
  ruta: string;
  lat: number;
  lng: number;
  ocupacion: number;
  eta: number;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class Mapa implements AfterViewInit {
  private map: any;
  private busMarkers: any[] = [];

  buses = signal<BusMarker[]>([
    { id: 'b1', placa: 'M-101ABC', ruta: 'Amatitlán → Villa Nueva', lat: 14.4769, lng: -90.6347, ocupacion: 12, eta: 5 },
    { id: 'b2', placa: 'M-202DEF', ruta: 'Villa Nueva → Zona 12', lat: 14.5250, lng: -90.5870, ocupacion: 28, eta: 12 },
    { id: 'b3', placa: 'M-303GHI', ruta: 'Amatitlán → Mixco', lat: 14.5010, lng: -90.6120, ocupacion: 8, eta: 18 },
  ]);

  selectedBus = signal<BusMarker | null>(null);

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
        attribution: '© OpenStreetMap',
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

      // Agregar marcadores de buses
      this.renderBusMarkers(leaflet);
    });
  }

  private renderBusMarkers(L: any) {
    this.buses().forEach((bus) => {
      const icon = L.divIcon({
        className: 'bus-marker',
        html: `<div style="background:#1E3A8A;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">🚌</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([bus.lat, bus.lng], { icon })
        .addTo(this.map)
        .on('click', () => this.selectedBus.set(bus));

      this.busMarkers.push(marker);
    });
  }

  cerrarDetalle() {
    this.selectedBus.set(null);
  }
}