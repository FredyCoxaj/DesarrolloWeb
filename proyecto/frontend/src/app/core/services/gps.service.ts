import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { GpsPosition, Incident, CreateIncidentDto, AdminAlert } from '../models';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class GpsService {
  private auth = inject(Auth);
  private socket: Socket | null = null;
  private simulationInterval: any = null;

  // Estados Reactivos con Signals
  readonly isConnected = signal<boolean>(false);
  readonly isSimulating = signal<boolean>(true);
  readonly buses = signal<GpsPosition[]>([
    {
      busId: 'b1',
      placa: 'M-101ABC',
      rutaId: 'r1',
      rutaNombre: 'Amatitlán → Villa Nueva',
      lat: 14.4769,
      lng: -90.6347,
      velocidadKmh: 42,
      rumbo: 45,
      timestamp: new Date().toISOString(),
      ocupacion: 22,
      capacidad: 40,
      estado: 'ACTIVO',
      choferNombre: 'Juan Carlos Gómez',
      siguienteParada: 'Mercado Municipal Amatitlán',
      etaMinutos: 4,
    },
    {
      busId: 'b2',
      placa: 'M-202DEF',
      rutaId: 'r2',
      rutaNombre: 'Villa Nueva → Zona 12',
      lat: 14.5250,
      lng: -90.5870,
      velocidadKmh: 35,
      rumbo: 20,
      timestamp: new Date().toISOString(),
      ocupacion: 34,
      capacidad: 45,
      estado: 'ACTIVO',
      choferNombre: 'Mario Estrada López',
      siguienteParada: 'Castañas / Calzada Aguilar Batres',
      etaMinutos: 8,
    },
    {
      busId: 'b3',
      placa: 'M-303GHI',
      rutaId: 'r3',
      rutaNombre: 'Amatitlán → Mixco',
      lat: 14.5010,
      lng: -90.6120,
      velocidadKmh: 48,
      rumbo: 320,
      timestamp: new Date().toISOString(),
      ocupacion: 18,
      capacidad: 38,
      estado: 'ACTIVO',
      choferNombre: 'Roberto Pérez Soto',
      siguienteParada: 'San Miguel Petapa',
      etaMinutos: 12,
    },
    {
      busId: 'b4',
      placa: 'M-404JKL',
      rutaId: 'r4',
      rutaNombre: 'Amatitlán → San Miguel Petapa',
      lat: 14.4820,
      lng: -90.6200,
      velocidadKmh: 0,
      rumbo: 90,
      timestamp: new Date().toISOString(),
      ocupacion: 15,
      capacidad: 35,
      estado: 'DETENIDO',
      choferNombre: 'Estuardo Raxón',
      siguienteParada: 'Cruce Villa Canales',
      etaMinutos: 15,
    },
  ]);

  // Historial de trayectoria por bus (para polyline en Leaflet)
  private busHistories: Map<string, [number, number][]> = new Map([
    [
      'b1',
      [
        [14.4769, -90.6347],
        [14.4805, -90.6280],
        [14.4880, -90.6200],
        [14.4950, -90.6120],
      ],
    ],
    [
      'b2',
      [
        [14.5250, -90.5870],
        [14.5380, -90.5780],
        [14.5520, -90.5690],
      ],
    ],
    [
      'b3',
      [
        [14.4769, -90.6347],
        [14.4910, -90.6210],
        [14.5010, -90.6120],
      ],
    ],
    [
      'b4',
      [
        [14.4769, -90.6347],
        [14.4820, -90.6200],
      ],
    ],
  ]);

  // Alertas e Incidencias en tiempo real
  readonly alerts = signal<AdminAlert[]>([
    {
      id: 'alt-1',
      tipo: 'BUS_DETENIDO',
      titulo: 'Bus Detenido por más de 12 min',
      mensaje: 'El bus M-404JKL no registra movimiento en Cruce Villa Canales.',
      severidad: 'WARNING',
      busId: 'b4',
      busPlaca: 'M-404JKL',
      choferNombre: 'Estuardo Raxón',
      fecha: new Date(Date.now() - 15 * 60000).toISOString(),
      leida: false,
      resuelta: false,
    },
    {
      id: 'alt-2',
      tipo: 'SOBRECUPO',
      titulo: 'Alta Ocupación (75%+)',
      mensaje: 'El bus M-202DEF en ruta Villa Nueva → Z12 reporta 34/45 pasajeros.',
      severidad: 'INFO',
      busId: 'b2',
      busPlaca: 'M-202DEF',
      choferNombre: 'Mario Estrada López',
      fecha: new Date(Date.now() - 5 * 60000).toISOString(),
      leida: false,
      resuelta: false,
    },
  ]);

  readonly incidents = signal<Incident[]>([
    {
      id: 'inc-1',
      tripId: 't-101',
      busId: 'b1',
      busPlaca: 'M-101ABC',
      choferId: 'ch-1',
      choferNombre: 'Juan Carlos Gómez',
      tipo: 'TRAFICO',
      severidad: 'MEDIA',
      descripcion: 'Congestionamiento moderado en el paso a desnivel de Naciones Unidas.',
      ubicacion: 'CA-9 Sur Km 21',
      lat: 14.5050,
      lng: -90.6020,
      fecha: new Date(Date.now() - 25 * 60000).toISOString(),
      atendida: false,
    },
  ]);

  // Alerta nueva subject para notificaciones toast
  readonly newAlert$ = new Subject<AdminAlert>();
  readonly newIncident$ = new Subject<Incident>();

  // Waypoints predefinidos para la simulación
  private routeWaypoints: Record<string, [number, number][]> = {
    r1: [
      [14.4769, -90.6347],
      [14.4805, -90.6280],
      [14.4920, -90.6150],
      [14.5050, -90.6020],
      [14.5150, -90.5920],
      [14.5250, -90.5870],
    ],
    r2: [
      [14.5250, -90.5870],
      [14.5420, -90.5730],
      [14.5600, -90.5610],
      [14.5800, -90.5500],
      [14.5950, -90.5400],
    ],
    r3: [
      [14.4769, -90.6347],
      [14.5020, -90.5610],
      [14.5450, -90.5800],
      [14.5900, -90.5950],
      [14.6350, -90.6100],
    ],
    r4: [
      [14.4769, -90.6347],
      [14.4890, -90.6050],
      [14.5020, -90.5610],
    ],
  };

  private currentWpIdx: Record<string, number> = { b1: 1, b2: 1, b3: 1, b4: 0 };

  constructor() {
    this.initSocket();
    this.startSimulation();
  }

  /**
   * Inicializa la conexión con el Socket.io backend
   */
  private initSocket() {
    try {
      const token = this.auth.getToken();
      this.socket = io(environment.wsUrl, {
        auth: { token: token || '' },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 5000,
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        this.isConnected.set(true);
        // Unirse a sala global de buses (F0)
        this.joinRoom('buses:all');
      });

      this.socket.on('disconnect', () => {
        this.isConnected.set(false);
      });

      // Escuchar posiciones de buses desde el backend
      this.socket.on('bus:location:update', (pos: GpsPosition) => {
        this.updateBusPosition(pos);
      });

      // Escuchar nuevas alertas
      this.socket.on('alert:new', (alert: AdminAlert) => {
        this.addAlert(alert);
      });

      // Escuchar nuevas incidencias
      this.socket.on('incident:new', (incident: Incident) => {
        this.addIncident(incident);
      });
    } catch {
      // Si el backend no está disponible, el simulador interno se encarga
      this.isConnected.set(false);
    }
  }

  /**
   * Unirse a una sala específica de WebSocket (F0)
   */
  joinRoom(room: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:room', { room });
    }
  }

  /**
   * Unirse a la sala de un bus específico (bus:${busId})
   */
  joinBusRoom(busId: string) {
    this.joinRoom(`bus:${busId}`);
  }

  /**
   * Salir de una sala
   */
  leaveRoom(room: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:room', { room });
    }
  }

  /**
   * Inicia el ciclo de simulación GPS interna (F1: envía posiciones cada 3s)
   */
  private startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.stepSimulation();
    }, 3000);
  }

  /**
   * Avanza la posición de cada bus en la simulación
   */
  private stepSimulation() {
    const updated = this.buses().map((bus) => {
      if (bus.estado === 'DETENIDO' || bus.estado === 'MANTENIMIENTO') {
        return bus;
      }

      const wps = this.routeWaypoints[bus.rutaId] || this.routeWaypoints['r1'];
      const currentIdx = this.currentWpIdx[bus.busId] || 0;
      const targetIdx = (currentIdx + 1) % wps.length;
      const target = wps[targetIdx];

      // Pequeño paso interpolado hacia el waypoint
      const factor = 0.08;
      const newLat = bus.lat + (target[0] - bus.lat) * factor;
      const newLng = bus.lng + (target[1] - bus.lng) * factor;

      // Calcular distancia al objetivo
      const dist = Math.hypot(target[0] - newLat, target[1] - newLng);
      if (dist < 0.003) {
        this.currentWpIdx[bus.busId] = targetIdx;
      }

      // Guardar historial para el polyline de trayectoria
      const history = this.busHistories.get(bus.busId) || [];
      history.push([newLat, newLng]);
      if (history.length > 50) history.shift();
      this.busHistories.set(bus.busId, history);

      // Calcular nuevo ETA y velocidad realista
      const speedVariation = Math.round(30 + Math.random() * 20);
      const eta = Math.max(1, (bus.etaMinutos ?? 5) - 0.05);

      return {
        ...bus,
        lat: Number(newLat.toFixed(6)),
        lng: Number(newLng.toFixed(6)),
        velocidadKmh: speedVariation,
        timestamp: new Date().toISOString(),
        etaMinutos: Math.round(eta),
      };
    });

    this.buses.set(updated);
  }

  /**
   * Obtener trayectoria histórica de un bus para polyline (F2)
   */
  getBusTrajectory(busId: string): [number, number][] {
    return this.busHistories.get(busId) || [];
  }

  /**
   * Obtiene la posición de un bus específico
   */
  getBusById(busId: string): GpsPosition | undefined {
    return this.buses().find((b) => b.busId === busId);
  }

  /**
   * Actualiza la posición de un bus
   */
  updateBusPosition(pos: GpsPosition) {
    const list = this.buses();
    const idx = list.findIndex((b) => b.busId === pos.busId);
    if (idx >= 0) {
      const copy = [...list];
      copy[idx] = { ...copy[idx], ...pos };
      this.buses.set(copy);
    } else {
      this.buses.set([...list, pos]);
    }

    // Agregar al historial
    const history = this.busHistories.get(pos.busId) || [];
    history.push([pos.lat, pos.lng]);
    if (history.length > 50) history.shift();
    this.busHistories.set(pos.busId, history);
  }

  /**
   * Chofer emite su posición en vivo
   */
  emitDriverLocation(busId: string, lat: number, lng: number, speed: number) {
    const payload: Partial<GpsPosition> = {
      busId,
      lat,
      lng,
      velocidadKmh: speed,
      timestamp: new Date().toISOString(),
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('driver:location', payload);
    }

    const current = this.getBusById(busId);
    if (current) {
      this.updateBusPosition({ ...current, ...payload } as GpsPosition);
    }
  }

  /**
   * Cambia el estado del viaje de un bus (INICIAR / FINALIZAR) (F4)
   */
  setBusTripStatus(busId: string, status: 'ACTIVO' | 'DETENIDO' | 'FUERA_SERVICIO') {
    const list = this.buses();
    const idx = list.findIndex((b) => b.busId === busId);
    if (idx >= 0) {
      const copy = [...list];
      copy[idx] = { ...copy[idx], estado: status, velocidadKmh: status === 'ACTIVO' ? 35 : 0 };
      this.buses.set(copy);
    }
  }

  /**
   * Reporta una nueva incidencia de chofer (F6)
   */
  reportIncident(dto: CreateIncidentDto, choferNombre = 'Chofer Asignado'): Incident {
    const bus = this.getBusById(dto.busId);
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      tripId: dto.tripId,
      busId: dto.busId,
      busPlaca: bus?.placa || 'Placa N/D',
      choferId: 'chofer-1',
      choferNombre,
      tipo: dto.tipo,
      severidad: dto.severidad,
      descripcion: dto.descripcion,
      ubicacion: dto.ubicacion || (bus ? `${bus.lat.toFixed(4)}, ${bus.lng.toFixed(4)}` : 'En ruta'),
      lat: dto.lat || bus?.lat,
      lng: dto.lng || bus?.lng,
      fecha: new Date().toISOString(),
      atendida: false,
    };

    this.addIncident(incident);

    // Generar alerta automática en tiempo real para el admin
    const alert: AdminAlert = {
      id: `alt-${Date.now()}`,
      tipo: 'INCIDENCIA',
      titulo: `Incidencia reportada: ${dto.tipo}`,
      mensaje: `${incident.choferNombre} en ${incident.busPlaca}: ${dto.descripcion}`,
      severidad: dto.severidad === 'CRITICA' || dto.severidad === 'ALTA' ? 'DANGER' : 'WARNING',
      busId: dto.busId,
      busPlaca: incident.busPlaca,
      choferNombre: incident.choferNombre,
      fecha: new Date().toISOString(),
      leida: false,
      resuelta: false,
    };

    this.addAlert(alert);

    if (this.socket && this.socket.connected) {
      this.socket.emit('incident:report', incident);
      this.socket.emit('alert:emit', alert);
    }

    return incident;
  }

  addIncident(incident: Incident) {
    this.incidents.set([incident, ...this.incidents()]);
    this.newIncident$.next(incident);
  }

  addAlert(alert: AdminAlert) {
    this.alerts.set([alert, ...this.alerts()]);
    this.newAlert$.next(alert);
  }

  markAlertAsRead(alertId: string) {
    this.alerts.set(
      this.alerts().map((a) => (a.id === alertId ? { ...a, leida: true } : a))
    );
  }

  resolveAlert(alertId: string) {
    this.alerts.set(
      this.alerts().map((a) => (a.id === alertId ? { ...a, resuelta: true, leida: true } : a))
    );
  }

  markIncidentAsResolved(incidentId: string) {
    this.incidents.set(
      this.incidents().map((i) => (i.id === incidentId ? { ...i, atendida: true } : i))
    );
  }
}
