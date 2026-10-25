import { Injectable, inject, signal } from '@angular/core';
import { GpsService } from './gps.service';
import { Api } from './api';
import { Bus, Route, AdminAlert, Incident } from '../models';

export interface AdminKpis {
  viajesHoy: number;
  ocupacionPromedioPct: number;
  ingresosHoyQ: number;
  busesActivos: number;
  totalBuses: number;
  pasajerosHoy: number;
}

export interface AdminDriver {
  id: string;
  nombre: string;
  dpi: string;
  telefono: string;
  licencia: string;
  busAsignadoPlaca?: string;
  estado: 'DISPONIBLE' | 'EN_RUTA' | 'DESCANSO';
  viajesCompletados: number;
  calificacion: number;
}

export interface RevenueDataPoint {
  dia: string;
  ingresos: number;
  viajes: number;
}

export interface BusRevenueSummary {
  busId: string;
  placa: string;
  rutaNombre: string;
  ingresosHoy: number;
  ingresosSemana: number;
  ingresosMes: number;
  viajesMes: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private gps = inject(GpsService);
  private api = inject(Api);

  // Lista de Buses para la Flota conectada a BD
  readonly buses = signal<Bus[]>([]);
  readonly loadingBuses = signal<boolean>(false);

  constructor() {
    this.loadBuses();
  }

  loadBuses() {
    this.loadingBuses.set(true);
    this.api.get<Bus[]>('/buses').subscribe({
      next: (data) => {
        this.loadingBuses.set(false);
        if (data && data.length > 0) {
          this.buses.set(data);
          const total = data.length;
          const activos = data.filter((b) => b.estado === 'ACTIVO').length;
          this.kpis.update((k) => ({
            ...k,
            totalBuses: total,
            busesActivos: activos,
          }));
        }
      },
      error: (err) => {
        this.loadingBuses.set(false);
        console.error('Error al cargar buses de la base de datos:', err);
      },
    });
  }

  // Lista de Choferes para CRUD (F11)
  readonly drivers = signal<AdminDriver[]>([
    { id: 'ch-1', nombre: 'Juan Carlos Gómez', dpi: '2541 89320 0101', telefono: '5543-9821', licencia: 'Tipo A', busAsignadoPlaca: 'M-101ABC', estado: 'EN_RUTA', viajesCompletados: 142, calificacion: 4.9 },
    { id: 'ch-2', nombre: 'Mario Estrada López', dpi: '1892 45312 0101', telefono: '4123-7744', licencia: 'Tipo A', busAsignadoPlaca: 'M-202DEF', estado: 'EN_RUTA', viajesCompletados: 128, calificacion: 4.8 },
    { id: 'ch-3', nombre: 'Roberto Pérez Soto', dpi: '3001 78421 0101', telefono: '5981-2233', licencia: 'Tipo A', busAsignadoPlaca: 'M-303GHI', estado: 'EN_RUTA', viajesCompletados: 98, calificacion: 4.7 },
    { id: 'ch-4', nombre: 'Estuardo Raxón', dpi: '2214 99801 0101', telefono: '3210-5566', licencia: 'Tipo B', busAsignadoPlaca: 'M-404JKL', estado: 'DESCANSO', viajesCompletados: 110, calificacion: 4.6 },
    { id: 'ch-5', nombre: 'Nelson David Orozco', dpi: '1678 33452 0101', telefono: '5012-9988', licencia: 'Tipo A', busAsignadoPlaca: 'M-505MNO', estado: 'DISPONIBLE', viajesCompletados: 85, calificacion: 4.85 },
    { id: 'ch-6', nombre: 'Ángel Morales Castillo', dpi: '2890 12456 0101', telefono: '4455-6677', licencia: 'Tipo A', busAsignadoPlaca: undefined, estado: 'DISPONIBLE', viajesCompletados: 64, calificacion: 4.5 },
  ]);

  // KPIs del Dashboard (F9)
  readonly kpis = signal<AdminKpis>({
    viajesHoy: 48,
    ocupacionPromedioPct: 76.5,
    ingresosHoyQ: 4280.00,
    busesActivos: 4,
    totalBuses: 6,
    pasajerosHoy: 856,
  });

  // Top 5 rutas más usadas (F9)
  readonly topRoutes = signal([
    { nombre: 'Amatitlán → Villa Nueva', pasajeros: 380, viajes: 18, porcentaje: 44 },
    { nombre: 'Villa Nueva → Zona 12', pasajeros: 295, viajes: 14, porcentaje: 34 },
    { nombre: 'Amatitlán → Mixco', pasajeros: 110, viajes: 8, porcentaje: 13 },
    { nombre: 'Amatitlán → San Miguel Petapa', pasajeros: 71, viajes: 8, porcentaje: 9 },
  ]);

  // Últimos viajes completados (F9)
  readonly recentTrips = signal([
    { id: 't-90', ruta: 'Amatitlán → Villa Nueva', busPlaca: 'M-101ABC', chofer: 'Juan Carlos Gómez', horaFin: '11:45 AM', ocupacion: '38/40', totalQ: 190.00, estado: 'COMPLETADO' },
    { id: 't-89', ruta: 'Villa Nueva → Zona 12', busPlaca: 'M-202DEF', chofer: 'Mario Estrada López', horaFin: '11:15 AM', ocupacion: '42/45', totalQ: 315.00, estado: 'COMPLETADO' },
    { id: 't-88', ruta: 'Amatitlán → Mixco', busPlaca: 'M-303GHI', chofer: 'Roberto Pérez Soto', horaFin: '10:50 AM', ocupacion: '30/38', totalQ: 300.00, estado: 'COMPLETADO' },
    { id: 't-87', ruta: 'Amatitlán → San Miguel Petapa', busPlaca: 'M-404JKL', chofer: 'Estuardo Raxón', horaFin: '10:20 AM', ocupacion: '28/35', totalQ: 112.00, estado: 'COMPLETADO' },
    { id: 't-86', ruta: 'Amatitlán → Villa Nueva', busPlaca: 'M-505MNO', chofer: 'Nelson Orozco', horaFin: '09:40 AM', ocupacion: '36/42', totalQ: 180.00, estado: 'COMPLETADO' },
  ]);

  // Datos para gráfico de ingresos últimos 7 días (F9 y F12)
  readonly revenueLast7Days = signal<RevenueDataPoint[]>([
    { dia: 'Lun', ingresos: 3840, viajes: 42 },
    { dia: 'Mar', ingresos: 4120, viajes: 45 },
    { dia: 'Mié', ingresos: 3950, viajes: 43 },
    { dia: 'Jue', ingresos: 4300, viajes: 46 },
    { dia: 'Vie', ingresos: 4890, viajes: 52 },
    { dia: 'Sáb', ingresos: 5200, viajes: 54 },
    { dia: 'Dom (Hoy)', ingresos: 4280, viajes: 48 },
  ]);

  // Resumen de ingresos por bus (F12)
  readonly busRevenueSummaries = signal<BusRevenueSummary[]>([
    { busId: 'b1', placa: 'M-101ABC', rutaNombre: 'Amatitlán → Villa Nueva', ingresosHoy: 950.00, ingresosSemana: 6400.00, ingresosMes: 26500.00, viajesMes: 280 },
    { busId: 'b2', placa: 'M-202DEF', rutaNombre: 'Villa Nueva → Zona 12', ingresosHoy: 1250.00, ingresosSemana: 8500.00, ingresosMes: 34100.00, viajesMes: 310 },
    { busId: 'b3', placa: 'M-303GHI', rutaNombre: 'Amatitlán → Mixco', ingresosHoy: 1100.00, ingresosSemana: 7800.00, ingresosMes: 30200.00, viajesMes: 240 },
    { busId: 'b4', placa: 'M-404JKL', rutaNombre: 'Amatitlán → Petapa', ingresosHoy: 480.00, ingresosSemana: 3600.00, ingresosMes: 15400.00, viajesMes: 190 },
    { busId: 'b5', placa: 'M-505MNO', rutaNombre: 'Amatitlán → Villa Nueva', ingresosHoy: 500.00, ingresosSemana: 4200.00, ingresosMes: 18000.00, viajesMes: 210 },
  ]);

  // Motivos de cancelación (F12)
  readonly cancellationsSummary = signal([
    { motivo: 'Retraso de tráfico severo', cantidad: 14, porcentaje: 45 },
    { motivo: 'Falla o avería mecánica', cantidad: 8, porcentaje: 26 },
    { motivo: 'Cambio de planes del usuario', cantidad: 6, porcentaje: 19 },
    { motivo: 'Otro / Emergencia', cantidad: 3, porcentaje: 10 },
  ]);

  // Alertas del sistema conectadas al GpsService
  get alerts() {
    return this.gps.alerts;
  }

  get incidents() {
    return this.gps.incidents;
  }

  // Operaciones CRUD Buses (F11)
  addBus(bus: Omit<Bus, 'id'>) {
    const payload = {
      placa: bus.placa.toUpperCase().trim(),
      modelo: bus.modelo?.trim() || undefined,
      marca: bus.marca?.trim() || undefined,
      anio: bus.anio && bus.anio >= 1990 ? Number(bus.anio) : 2022,
      capacidad: Number(bus.capacidad) || 40,
      estado: bus.estado,
    };

    this.api.post<Bus>('/buses', payload).subscribe({
      next: (nuevo) => {
        this.buses.update((list) => [nuevo, ...list]);
        this.loadBuses();
      },
      error: (err) => {
        console.error('Error al registrar bus en backend:', err);
        alert(err.message || 'Error al registrar el bus en la base de datos');
      },
    });
  }

  updateBus(bus: Bus) {
    const payload = {
      placa: bus.placa.toUpperCase().trim(),
      modelo: bus.modelo?.trim() || undefined,
      marca: bus.marca?.trim() || undefined,
      anio: bus.anio && bus.anio >= 1990 ? Number(bus.anio) : 2022,
      capacidad: Number(bus.capacidad) || 40,
      estado: bus.estado,
    };

    this.api.patch<Bus>(`/buses/${bus.id}`, payload).subscribe({
      next: (actualizado) => {
        this.buses.update((list) => list.map((b) => (b.id === bus.id ? { ...b, ...actualizado } : b)));
        this.loadBuses();
      },
      error: (err) => {
        console.error('Error al actualizar bus en backend:', err);
        alert(err.message || 'Error al actualizar el bus en la base de datos');
      },
    });
  }

  deleteBus(id: string) {
    this.api.delete(`/buses/${id}`).subscribe({
      next: (res: any) => {
        this.buses.update((list) => list.filter((b) => b.id !== id));
        this.loadBuses();
      },
      error: (err) => {
        console.error('Error al dar de baja bus en backend:', err);
        alert(err.message || 'Error al procesar la baja del bus en la base de datos');
      },
    });
  }

  // Operaciones CRUD Choferes (F11)
  addDriver(driver: Omit<AdminDriver, 'id' | 'viajesCompletados' | 'calificacion'>) {
    const newDriver: AdminDriver = {
      ...driver,
      id: `ch-${Date.now()}`,
      viajesCompletados: 0,
      calificacion: 5.0,
    };
    this.drivers.set([...this.drivers(), newDriver]);
  }

  updateDriver(driver: AdminDriver) {
    this.drivers.set(this.drivers().map((d) => (d.id === driver.id ? driver : d)));
  }

  deleteDriver(id: string) {
    this.drivers.set(this.drivers().filter((d) => d.id !== id));
  }

  assignDriverToBus(driverId: string, busPlaca: string) {
    this.drivers.set(
      this.drivers().map((d) => (d.id === driverId ? { ...d, busAsignadoPlaca: busPlaca } : d))
    );
  }

  /**
   * Exporta reporte de ingresos y viajes en formato CSV descargable (F12)
   */
  exportReportCsv() {
    const headers = 'Placa,Ruta,Ingresos Hoy (GTQ),Ingresos Semana (GTQ),Ingresos Mes (GTQ),Viajes Mes\n';
    const rows = this.busRevenueSummaries()
      .map(
        (b) =>
          `"${b.placa}","${b.rutaNombre}",${b.ingresosHoy.toFixed(2)},${b.ingresosSemana.toFixed(2)},${b.ingresosMes.toFixed(2)},${b.viajesMes}`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `reporte_rutabus_ingresos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }
}
