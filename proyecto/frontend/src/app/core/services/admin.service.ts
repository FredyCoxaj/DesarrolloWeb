import { Injectable, inject, signal } from '@angular/core';
import { GpsService } from './gps.service';
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
  municipios: string[];
  ingresosHoy: number;
  ingresosAyer: number;
  ingresosSemana: number;
  ingresosMes: number;
  ingresosAnio: number;
  viajesHoy: number;
  viajesSemana: number;
  viajesMes: number;
  viajesAnio: number;
}

export interface CancellationRecord {
  id: string;
  motivo: string;
  categoria: 'OPERATIVOS' | 'MECANICAS' | 'USUARIO' | 'CLIMA_BLOQUEO';
  categoriaNombre: string;
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
  busPlaca: string;
  rutaNombre: string;
  municipio: string;
  fecha: string;
  pasajerosAfectados: number;
  reembolsoQ: number;
  descripcion: string;
}


@Injectable({ providedIn: 'root' })
export class AdminService {
  private gps = inject(GpsService);

  // Lista de Buses para la Flota (F11)
  readonly buses = signal<Bus[]>([
    { id: 'b1', placa: 'M-101ABC', capacidad: 40, modelo: 'Mercedes-Benz Sprinter 516', anio: 2022, estado: 'ACTIVO' },
    { id: 'b2', placa: 'M-202DEF', capacidad: 45, modelo: 'Hino AK 176', anio: 2021, estado: 'ACTIVO' },
    { id: 'b3', placa: 'M-303GHI', capacidad: 38, modelo: 'Toyota Coaster', anio: 2023, estado: 'ACTIVO' },
    { id: 'b4', placa: 'M-404JKL', capacidad: 35, modelo: 'Isuzu NPR Bus', anio: 2020, estado: 'MANTENIMIENTO' },
    { id: 'b5', placa: 'M-505MNO', capacidad: 42, modelo: 'Mercedes-Benz O500', anio: 2022, estado: 'ACTIVO' },
    { id: 'b6', placa: 'M-606PQR', capacidad: 40, modelo: 'Hino Rainbow', anio: 2019, estado: 'FUERA_SERVICIO' },
  ]);

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

  // Resumen de ingresos por bus (F12) con métricas multi-período y municipios
  readonly busRevenueSummaries = signal<BusRevenueSummary[]>([
    {
      busId: 'b1',
      placa: 'M-101ABC',
      rutaNombre: 'Amatitlán → Villa Nueva',
      municipios: ['Amatitlán', 'Villa Nueva'],
      ingresosHoy: 950.00,
      ingresosAyer: 880.00,
      ingresosSemana: 6400.00,
      ingresosMes: 26500.00,
      ingresosAnio: 295000.00,
      viajesHoy: 10,
      viajesSemana: 68,
      viajesMes: 280,
      viajesAnio: 3100,
    },
    {
      busId: 'b2',
      placa: 'M-202DEF',
      rutaNombre: 'Villa Nueva → Zona 12',
      municipios: ['Villa Nueva', 'Zona 12'],
      ingresosHoy: 1250.00,
      ingresosAyer: 1180.00,
      ingresosSemana: 8500.00,
      ingresosMes: 34100.00,
      ingresosAnio: 382000.00,
      viajesHoy: 12,
      viajesSemana: 76,
      viajesMes: 310,
      viajesAnio: 3450,
    },
    {
      busId: 'b3',
      placa: 'M-303GHI',
      rutaNombre: 'Amatitlán → Mixco',
      municipios: ['Amatitlán', 'Mixco'],
      ingresosHoy: 1100.00,
      ingresosAyer: 1050.00,
      ingresosSemana: 7800.00,
      ingresosMes: 30200.00,
      ingresosAnio: 335000.00,
      viajesHoy: 9,
      viajesSemana: 60,
      viajesMes: 240,
      viajesAnio: 2700,
    },
    {
      busId: 'b4',
      placa: 'M-404JKL',
      rutaNombre: 'Amatitlán → Petapa',
      municipios: ['Amatitlán', 'Petapa'],
      ingresosHoy: 480.00,
      ingresosAyer: 460.00,
      ingresosSemana: 3600.00,
      ingresosMes: 15400.00,
      ingresosAnio: 172000.00,
      viajesHoy: 6,
      viajesSemana: 45,
      viajesMes: 190,
      viajesAnio: 2150,
    },
    {
      busId: 'b5',
      placa: 'M-505MNO',
      rutaNombre: 'Amatitlán → Villa Nueva',
      municipios: ['Amatitlán', 'Villa Nueva'],
      ingresosHoy: 500.00,
      ingresosAyer: 520.00,
      ingresosSemana: 4200.00,
      ingresosMes: 18000.00,
      ingresosAnio: 201000.00,
      viajesHoy: 7,
      viajesSemana: 50,
      viajesMes: 210,
      viajesAnio: 2350,
    },
    {
      busId: 'b6',
      placa: 'M-606PQR',
      rutaNombre: 'Villa Nueva → Zona 12',
      municipios: ['Villa Nueva', 'Zona 12'],
      ingresosHoy: 420.00,
      ingresosAyer: 390.00,
      ingresosSemana: 3100.00,
      ingresosMes: 13200.00,
      ingresosAnio: 148000.00,
      viajesHoy: 5,
      viajesSemana: 38,
      viajesMes: 160,
      viajesAnio: 1800,
    },
  ]);

  // Registro detallado de cancelaciones e incidencias (F12)
  readonly cancellationRecords = signal<CancellationRecord[]>([
    {
      id: 'can-1',
      motivo: 'Retraso de tráfico severo en Cuesta de Villalobos',
      categoria: 'OPERATIVOS',
      categoriaNombre: 'Problemas Operativos (Tráfico)',
      severidad: 'ALTA',
      busPlaca: 'M-101ABC',
      rutaNombre: 'Amatitlán → Villa Nueva',
      municipio: 'Villa Nueva',
      fecha: '2026-10-22 08:30',
      pasajerosAfectados: 36,
      reembolsoQ: 180.00,
      descripcion: 'Congestionamiento de 45 minutos impidió completar el tramo matutino.',
    },
    {
      id: 'can-2',
      motivo: 'Falla mecánica en sistema de frenos',
      categoria: 'MECANICAS',
      categoriaNombre: 'Fallas Mecánicas',
      severidad: 'ALTA',
      busPlaca: 'M-404JKL',
      rutaNombre: 'Amatitlán → Petapa',
      municipio: 'Amatitlán',
      fecha: '2026-10-22 09:15',
      pasajerosAfectados: 28,
      reembolsoQ: 280.00,
      descripcion: 'Avería neumática requirió envío de unidad de auxilio técnico.',
    },
    {
      id: 'can-3',
      motivo: 'Tráfico pesado en paso a desnivel Naciones Unidas',
      categoria: 'OPERATIVOS',
      categoriaNombre: 'Problemas Operativos (Tráfico)',
      severidad: 'MEDIA',
      busPlaca: 'M-202DEF',
      rutaNombre: 'Villa Nueva → Zona 12',
      municipio: 'Villa Nueva',
      fecha: '2026-10-21 17:40',
      pasajerosAfectados: 24,
      reembolsoQ: 180.00,
      descripcion: 'Colisión menor ajena al bus bloqueó ambos carriles durante 30 min.',
    },
    {
      id: 'can-4',
      motivo: 'Cambio de planes del usuario / Desistimiento',
      categoria: 'USUARIO',
      categoriaNombre: 'Factores del Usuario',
      severidad: 'BAJA',
      busPlaca: 'M-303GHI',
      rutaNombre: 'Amatitlán → Mixco',
      municipio: 'Amatitlán',
      fecha: '2026-10-21 14:10',
      pasajerosAfectados: 5,
      reembolsoQ: 50.00,
      descripcion: 'Pasajeros cancelaron reserva por cambio de horario de reunión.',
    },
    {
      id: 'can-5',
      motivo: 'Falla de alternador eléctrico en terminal',
      categoria: 'MECANICAS',
      categoriaNombre: 'Fallas Mecánicas',
      severidad: 'ALTA',
      busPlaca: 'M-606PQR',
      rutaNombre: 'Villa Nueva → Zona 12',
      municipio: 'Zona 12',
      fecha: '2026-10-20 06:45',
      pasajerosAfectados: 32,
      reembolsoQ: 240.00,
      descripcion: 'El bus no encendió al iniciar primer turno de la mañana.',
    },
    {
      id: 'can-6',
      motivo: 'Bloqueo o manifestación en Calzada Roosevelt',
      categoria: 'CLIMA_BLOQUEO',
      categoriaNombre: 'Clima / Bloqueos',
      severidad: 'ALTA',
      busPlaca: 'M-303GHI',
      rutaNombre: 'Amatitlán → Mixco',
      municipio: 'Mixco',
      fecha: '2026-10-19 11:20',
      pasajerosAfectados: 30,
      reembolsoQ: 300.00,
      descripcion: 'Cierre total de paso en El Campanero obligó a cancelar el retorno.',
    },
    {
      id: 'can-7',
      motivo: 'Lluvias torrenciales y acumulación de agua',
      categoria: 'CLIMA_BLOQUEO',
      categoriaNombre: 'Clima / Bloqueos',
      severidad: 'MEDIA',
      busPlaca: 'M-404JKL',
      rutaNombre: 'Amatitlán → Petapa',
      municipio: 'Petapa',
      fecha: '2026-10-18 16:30',
      pasajerosAfectados: 20,
      reembolsoQ: 80.00,
      descripcion: 'Inundación temporal en Boulevard El Frutal.',
    },
    {
      id: 'can-8',
      motivo: 'Confusión de parada por parte de usuarios',
      categoria: 'USUARIO',
      categoriaNombre: 'Factores del Usuario',
      severidad: 'BAJA',
      busPlaca: 'M-505MNO',
      rutaNombre: 'Amatitlán → Villa Nueva',
      municipio: 'Amatitlán',
      fecha: '2026-10-18 13:00',
      pasajerosAfectados: 3,
      reembolsoQ: 15.00,
      descripcion: 'Grupo de pasajeros perdió el abordaje por no presentarse en la parada pactada.',
    },
    {
      id: 'can-9',
      motivo: 'Desperfecto en neumático trasero',
      categoria: 'MECANICAS',
      categoriaNombre: 'Fallas Mecánicas',
      severidad: 'MEDIA',
      busPlaca: 'M-101ABC',
      rutaNombre: 'Amatitlán → Villa Nueva',
      municipio: 'Amatitlán',
      fecha: '2026-10-16 10:15',
      pasajerosAfectados: 18,
      reembolsoQ: 90.00,
      descripcion: 'Pinchazo en CA-9 Sur km 27 solventado en 25 minutos.',
    },
    {
      id: 'can-10',
      motivo: 'Congestión vehicular extrema en Aguilar Batres',
      categoria: 'OPERATIVOS',
      categoriaNombre: 'Problemas Operativos (Tráfico)',
      severidad: 'MEDIA',
      busPlaca: 'M-202DEF',
      rutaNombre: 'Villa Nueva → Zona 12',
      municipio: 'Zona 12',
      fecha: '2026-10-15 18:20',
      pasajerosAfectados: 22,
      reembolsoQ: 165.00,
      descripcion: 'Tráfico de hora pico provocó retraso mayor a 50 min en CENMA.',
    },
  ]);

  // Motivos consolidados de cancelación (F12)
  readonly cancellationsSummary = signal([
    { motivo: 'Problemas Operativos (Tráfico)', cantidad: 14, porcentaje: 45 },
    { motivo: 'Fallas Mecánicas', cantidad: 8, porcentaje: 26 },
    { motivo: 'Factores del Usuario', cantidad: 6, porcentaje: 19 },
    { motivo: 'Clima / Bloqueos', cantidad: 3, porcentaje: 10 },
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
    const newBus: Bus = {
      ...bus,
      id: `b-${Date.now()}`,
    };
    this.buses.set([...this.buses(), newBus]);
  }

  updateBus(bus: Bus) {
    this.buses.set(this.buses().map((b) => (b.id === bus.id ? bus : b)));
  }

  deleteBus(id: string) {
    this.buses.set(this.buses().filter((b) => b.id !== id));
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
   * Si se pasa filteredData, exporta únicamente las filas y métricas que están filtradas en pantalla.
   */
  exportReportCsv(
    filteredData?: {
      placa: string;
      rutaNombre: string;
      municipiosTexto?: string;
      ingresosPeriodo: number;
      viajesPeriodo: number;
      promedioPorViaje: number;
    }[],
    periodLabel = 'Últimos 30 días'
  ) {
    const headers = 'Placa,Ruta Principal,Municipios,Período Analizado,Ingresos (GTQ),Viajes Realizados,Promedio por Viaje (GTQ)\n';
    const dataToExport =
      filteredData ||
      this.busRevenueSummaries().map((b) => ({
        placa: b.placa,
        rutaNombre: b.rutaNombre,
        municipiosTexto: b.municipios?.join(' - ') || 'Metropolitana',
        ingresosPeriodo: b.ingresosMes,
        viajesPeriodo: b.viajesMes,
        promedioPorViaje: b.viajesMes > 0 ? b.ingresosMes / b.viajesMes : 0,
      }));

    const rows = dataToExport
      .map(
        (b) =>
          `"${b.placa}","${b.rutaNombre}","${b.municipiosTexto || 'Metropolitana'}","${periodLabel}",${b.ingresosPeriodo.toFixed(2)},${b.viajesPeriodo},${b.promedioPorViaje.toFixed(2)}`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanPeriod = periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `reporte_rutabus_${cleanPeriod}_${dateStr}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }
}

