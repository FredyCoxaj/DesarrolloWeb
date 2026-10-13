import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoutesService } from '../../../core/services/routes';
import { TicketsService } from '../../../core/services/tickets';
import { Route } from '../../../core/models';
import { SeatMap } from '../../../shared/components/seat-map/seat-map';

type Step = 1 | 2 | 3 | 4;
type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'CUENTA';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [FormsModule, RouterLink, SeatMap],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class Reserva implements OnInit, AfterViewInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private routesService = inject(RoutesService);
  private ticketsService = inject(TicketsService);

  step = signal<Step>(1);
  route = signal<Route | null>(null);
  notFound = signal(false);

  boardingStopId = signal<string>('');
  alightingStopId = signal<string>('');
  selectedSeat = signal<number | null>(null);
  paymentMethod = signal<PaymentMethod>('EFECTIVO');

  qrDataUrl = signal<string | null>(null);
  ticketId = signal<string>('');

  occupiedSeats = [3, 7, 12, 18, 25, 31];

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      return;
    }

    this.routesService.getById(id).subscribe((r) => {
      if (r) {
        this.route.set(r);
        this.boardingStopId.set(r.paradas[0].id);
        this.alightingStopId.set(r.paradas[r.paradas.length - 1].id);
      } else {
        this.notFound.set(true);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMapIfNeeded(), 200);
  }

  private initMapIfNeeded() {
    if (this.step() !== 1 || !this.route()) return;

    import('leaflet').then((L) => {
      const leaflet = (L as any).default || L;
      const el = document.getElementById('reserva-map');
      if (!el || (el as any)._leaflet_id) return;

      const route = this.route()!;
      const map = leaflet.map('reserva-map', {
        center: [route.paradas[0].lat, route.paradas[0].lng],
        zoom: 12,
        zoomControl: false,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const coords: [number, number][] = [];
      route.paradas.forEach((p, i) => {
        coords.push([p.lat, p.lng]);
        leaflet.marker([p.lat, p.lng], {
          icon: leaflet.divIcon({
            className: 'stop-marker',
            html: `<div style="background:#1E3A8A;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid white">${i + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        }).addTo(map);
      });

      leaflet.polyline(coords, { color: '#1E3A8A', weight: 3, opacity: 0.6 }).addTo(map);
      map.fitBounds(coords, { padding: [30, 30] });
    });
  }

  get precioTramo(): number {
    const r = this.route();
    if (!r) return 0;
    const idxSubida = r.paradas.findIndex((p) => p.id === this.boardingStopId());
    const idxBajada = r.paradas.findIndex((p) => p.id === this.alightingStopId());
    const totalParadas = r.paradas.length - 1;
    if (totalParadas <= 0 || idxSubida < 0 || idxBajada < 0) return r.precio;
    const tramos = Math.abs(idxBajada - idxSubida);
    return (r.precio / totalParadas) * tramos;
  }

  get puedeContinuarPaso1(): boolean {
    return !!this.boardingStopId() && !!this.alightingStopId() &&
           this.boardingStopId() !== this.alightingStopId();
  }

  nextStep() {
    if (this.step() === 1 && !this.puedeContinuarPaso1) return;
    if (this.step() === 2 && !this.selectedSeat()) return;

    const current = this.step();
    if (current < 3) {
      this.step.set((current + 1) as Step);
    } else if (current === 3) {
      this.confirmarReserva();
    }
  }

  prevStep() {
    const current = this.step();
    if (current > 1) this.step.set((current - 1) as Step);
  }

  onSeatSelected(seat: number) {
    this.selectedSeat.set(seat);
  }

  async confirmarReserva() {
    const id = 'TKT-' + Date.now().toString(36).toUpperCase();
    this.ticketId.set(id);

    const route = this.route()!;
    const boardingStop = route.paradas.find((p) => p.id === this.boardingStopId())!;
    const alightingStop = route.paradas.find((p) => p.id === this.alightingStopId())!;

    const qrContent = JSON.stringify({
      ticketId: id,
      routeId: route.id,
      seat: this.selectedSeat(),
      boarding: this.boardingStopId(),
      alighting: this.alightingStopId(),
      precio: this.precioTramo.toFixed(2),
    });

    const QRCode = await import('qrcode');
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 240,
      margin: 1,
      color: { dark: '#1E3A8A', light: '#FFFFFF' },
    });

    this.qrDataUrl.set(dataUrl);

    this.ticketsService.add({
      id,
      tripId: 'trip-mock',
      routeId: route.id,
      routeName: route.nombre,
      asiento: this.selectedSeat()!,
      boardingStopId: boardingStop.id,
      boardingStopName: boardingStop.nombre,
      alightingStopId: alightingStop.id,
      alightingStopName: alightingStop.nombre,
      estado: this.paymentMethod() === 'EFECTIVO' ? 'RESERVADO' : 'PAGADO',
      qrDataUrl: dataUrl,
      fecha: new Date().toISOString(),
      precio: this.precioTramo,
    });

    this.step.set(4);
  }

  irAlMapa() {
    this.router.navigate(['/pasajero/mapa']);
  }
}