import { Component, inject, signal, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChoferService, ChoferPassenger } from '../../../core/services/chofer.service';
import { GpsService } from '../../../core/services/gps.service';
import { IncidentType, IncidentSeverity } from '../../../core/models';

@Component({
  selector: 'app-viaje-activo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viaje-activo.html',
  styleUrl: './viaje-activo.scss',
})
export class ViajeActivo implements AfterViewInit, OnDestroy {
  private choferService = inject(ChoferService);
  private gpsService = inject(GpsService);

  readonly trip = this.choferService.activeTrip;
  readonly busPosition = computed(() => this.gpsService.getBusById(this.trip().busId));

  // Filtro y búsqueda de pasajeros (F5)
  searchQuery = signal<string>('');
  selectedFilter = signal<'TODOS' | 'PENDIENTES' | 'PAGADOS'>('TODOS');

  filteredPasajeros = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();
    return this.trip().pasajeros.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(q) ||
        p.asiento.toString().includes(q) ||
        p.paradaBajada.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (filter === 'PENDIENTES') return p.pagoEstado === 'PENDIENTE';
      if (filter === 'PAGADOS') return p.pagoEstado === 'PAGADO';
      return true;
    });
  });

  // Modal Cobro en Efectivo (F5)
  showCashModal = signal<boolean>(false);
  cashTargetPassenger = signal<ChoferPassenger | null>(null);
  cashAmount = 5.00;
  paymentSuccessMsg = signal<string | null>(null);

  // Modal Reportar Incidencia (F6)
  showIncidentModal = signal<boolean>(false);
  incidentType: IncidentType = 'TRAFICO';
  incidentSeverity: IncidentSeverity = 'MEDIA';
  incidentDesc = '';
  incidentLocation = '';
  incidentSuccessMsg = signal<string | null>(null);

  // Leaflet map reference
  private map: any = null;
  private busMarker: any = null;
  private polyline: any = null;
  private refreshSub: any = null;

  ngAfterViewInit() {
    this.initMiniMap();
  }

  ngOnDestroy() {
    if (this.refreshSub) clearInterval(this.refreshSub);
    if (this.map) {
      try {
        this.map.remove();
      } catch {
        // cleanup safe
      }
    }
  }

  private initMiniMap() {
    import('leaflet').then((L) => {
      const leaflet = (L as any).default || L;
      const initialPos = this.busPosition() || { lat: 14.4769, lng: -90.6347 };

      const mapContainer = document.getElementById('driver-mini-map');
      if (!mapContainer) return;

      this.map = leaflet.map('driver-mini-map', {
        center: [initialPos.lat, initialPos.lng],
        zoom: 14,
        zoomControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);

      // Icono de bus dinámico
      const busIcon = leaflet.divIcon({
        className: 'driver-bus-icon',
        html: `<div style="background:#F59E0B;color:#0F172A;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:17px;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,.4)">🚌</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      this.busMarker = leaflet.marker([initialPos.lat, initialPos.lng], { icon: busIcon })
        .addTo(this.map)
        .bindPopup(`<strong>Bus ${this.trip().busPlaca}</strong><br>Velocidad en vivo`);

      // Polyline para la trayectoria
      this.polyline = leaflet.polyline([], {
        color: '#F59E0B',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 6',
      }).addTo(this.map);

      // Actualizar posición del bus en mapa en tiempo real
      this.refreshSub = setInterval(() => {
        const cur = this.busPosition();
        if (cur && this.busMarker && this.map) {
          this.busMarker.setLatLng([cur.lat, cur.lng]);
          const history = this.gpsService.getBusTrajectory(this.trip().busId);
          if (history.length > 0 && this.polyline) {
            this.polyline.setLatLngs(history);
          }
        }
      }, 3000);
    });
  }

  iniciarViaje() {
    this.choferService.startTrip();
  }

  finalizarViaje() {
    if (confirm('¿Estás seguro de finalizar este viaje? Los datos se guardarán en tu historial de turno.')) {
      this.choferService.finishTrip();
    }
  }

  // Métodos F5: Cobro en Efectivo
  openCashModal(p: ChoferPassenger) {
    this.cashTargetPassenger.set(p);
    this.cashAmount = p.monto || 5.00;
    this.paymentSuccessMsg.set(null);
    this.showCashModal.set(true);
  }

  closeCashModal() {
    this.showCashModal.set(false);
    this.cashTargetPassenger.set(null);
  }

  confirmCashPayment() {
    const target = this.cashTargetPassenger();
    if (!target) return;

    const ok = this.choferService.registerCashPayment(target.ticketId, this.cashAmount);
    if (ok) {
      this.paymentSuccessMsg.set(`¡Cobro de Q${this.cashAmount.toFixed(2)} registrado con éxito para asiento #${target.asiento}!`);
      setTimeout(() => {
        this.closeCashModal();
        this.paymentSuccessMsg.set(null);
      }, 1400);
    }
  }

  // Métodos F6: Reporte de Incidencias
  openIncidentModal() {
    this.incidentDesc = '';
    this.incidentLocation = this.trip().siguienteParada || 'En ruta';
    this.incidentSuccessMsg.set(null);
    this.showIncidentModal.set(true);
  }

  closeIncidentModal() {
    this.showIncidentModal.set(false);
  }

  submitIncident() {
    if (!this.incidentDesc.trim()) {
      alert('Por favor ingresa una descripción de la incidencia.');
      return;
    }

    this.choferService.reportIncident({
      tipo: this.incidentType,
      severidad: this.incidentSeverity,
      descripcion: this.incidentDesc,
      ubicacion: this.incidentLocation,
    });

    this.incidentSuccessMsg.set('¡Incidencia enviada al Administrador en tiempo real!');
    setTimeout(() => {
      this.closeIncidentModal();
      this.incidentSuccessMsg.set(null);
    }, 1500);
  }
}
