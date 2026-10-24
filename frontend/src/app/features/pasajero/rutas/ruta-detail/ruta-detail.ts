import { Component, inject, signal, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoutesService } from '../../../../core/services/routes';
import { Route } from '../../../../core/models';
@Component({
  selector: 'app-ruta-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ruta-detail.html',
  styleUrl: './ruta-detail.scss'
})
export class RutaDetail implements OnInit, AfterViewInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private routesService = inject(RoutesService);

  route = signal<Route | null>(null);
  notFound = signal(false);

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      return;
    }

    this.routesService.getById(id).subscribe((r) => {
      if (r) {
        this.route.set(r);
      } else {
        this.notFound.set(true);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  private initMap() {
    const route = this.route();
    if (!route || !route.stops || route.stops.length === 0) return;

    import('leaflet').then((L) => {
      const leaflet = (L as any).default || L;

      const map = leaflet.map('route-map', {
        center: [route.stops[0].latitud, route.stops[0].longitud],
        zoom: 12,
        zoomControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const coords: [number, number][] = [];

      route.stops.forEach((parada, index: number) => {
        coords.push([parada.latitud, parada.longitud]);

        leaflet.marker([parada.latitud, parada.longitud], {
          icon: leaflet.divIcon({
            className: 'stop-marker',
            html: `<div style="background:#1E3A8A;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3)">${index + 1}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        }).addTo(map).bindPopup(`<b>${parada.nombre}</b>`);
      });

      leaflet.polyline(coords, {
        color: '#1E3A8A',
        weight: 4,
        opacity: 0.7,
      }).addTo(map);

      map.fitBounds(coords, { padding: [30, 30] });
    });
  }

  reservar() {
    const route = this.route();
    if (route) {
      this.router.navigate(['/pasajero/reserva', route.id]);
    }
  }
}