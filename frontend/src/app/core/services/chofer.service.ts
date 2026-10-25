import { Injectable, inject, signal } from '@angular/core';
import { GpsService } from './gps.service';
import { CreateIncidentDto, Incident } from '../models';

export interface ChoferPassenger {
  ticketId: string;
  nombre: string;
  asiento: number;
  paradaSubida: string;
  paradaBajada: string;
  pagoEstado: 'PAGADO' | 'PENDIENTE';
  metodoPago: 'EFECTIVO' | 'DIGITAL' | 'PENDIENTE';
  monto: number;
  horaAbordaje?: string;
}

export interface ChoferStop {
  id: string;
  nombre: string;
  orden: number;
  horaEstimada: string;
  estado: 'COMPLETADA' | 'ACTUAL' | 'PENDIENTE';
  pasajerosSuben: number;
  pasajerosBajan: number;
}

export interface ChoferTrip {
  id: string;
  rutaId: string;
  rutaNombre: string;
  origen: string;
  destino: string;
  busId: string;
  busPlaca: string;
  horaSalida: string;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';
  capacidad: number;
  ocupacionActual: number;
  etaDestinoMinutos: number;
  siguienteParada: string;
  paradas: ChoferStop[];
  pasajeros: ChoferPassenger[];
}

export interface ChoferCobroRecord {
  id: string;
  ticketId: string;
  pasajeroNombre: string;
  asiento: number;
  monto: number;
  metodo: 'EFECTIVO' | 'DIGITAL';
  hora: string;
}

export interface ChoferHistoricalTrip {
  id: string;
  fecha: string;
  rutaNombre: string;
  busPlaca: string;
  horaInicio: string;
  horaFin: string;
  pasajerosTotales: number;
  totalRecaudado: number;
  estado: 'COMPLETADO';
}

@Injectable({ providedIn: 'root' })
export class ChoferService {
  private gps = inject(GpsService);

  // Chofer perfil mock
  readonly choferProfile = signal({
    id: 'ch-1',
    nombre: 'Juan Carlos Gómez',
    dpi: '2541 89320 0101',
    telefono: '+502 5543-9821',
    licencia: 'Tipo A - Profesional',
    busAsignado: 'M-101ABC',
    calificacion: 4.9,
    viajesHoy: 3,
  });

  // Viaje Activo (F4)
  readonly activeTrip = signal<ChoferTrip>({
    id: 'trip-current-1',
    rutaId: 'r1',
    rutaNombre: 'Amatitlán → Villa Nueva',
    origen: 'Parque Central Amatitlán',
    destino: 'Centro de Villa Nueva',
    busId: 'b1',
    busPlaca: 'M-101ABC',
    horaSalida: '07:30 AM',
    estado: 'PROGRAMADO',
    capacidad: 40,
    ocupacionActual: 14,
    etaDestinoMinutos: 35,
    siguienteParada: 'Parque Central Amatitlán (En terminal)',
    paradas: [
      { id: 'cp-1', nombre: 'Parque Central Amatitlán', orden: 1, horaEstimada: '07:30 AM', estado: 'ACTUAL', pasajerosSuben: 14, pasajerosBajan: 0 },
      { id: 'cp-2', nombre: 'Mercado Municipal Amatitlán', orden: 2, horaEstimada: '07:42 AM', estado: 'PENDIENTE', pasajerosSuben: 10, pasajerosBajan: 2 },
      { id: 'cp-3', nombre: 'CA-9 Sur Km 29', orden: 3, horaEstimada: '07:55 AM', estado: 'PENDIENTE', pasajerosSuben: 4, pasajerosBajan: 1 },
      { id: 'cp-4', nombre: 'Entrada Naciones Unidas', orden: 4, horaEstimada: '08:05 AM', estado: 'PENDIENTE', pasajerosSuben: 3, pasajerosBajan: 6 },
      { id: 'cp-5', nombre: 'Pasarela Bárcenas', orden: 5, horaEstimada: '08:14 AM', estado: 'PENDIENTE', pasajerosSuben: 2, pasajerosBajan: 8 },
      { id: 'cp-6', nombre: 'Entrada Villa Nueva Centro', orden: 6, horaEstimada: '08:25 AM', estado: 'PENDIENTE', pasajerosSuben: 0, pasajerosBajan: 15 },
    ],
    pasajeros: [
      { ticketId: 'tk-101', nombre: 'Carlos Mendoza', asiento: 1, paradaSubida: 'Parque Central', paradaBajada: 'Villa Nueva', pagoEstado: 'PAGADO', metodoPago: 'DIGITAL', monto: 5.00, horaAbordaje: '07:28 AM' },
      { ticketId: 'tk-102', nombre: 'Sofía Álvarez', asiento: 2, paradaSubida: 'Parque Central', paradaBajada: 'Bárcenas', pagoEstado: 'PAGADO', metodoPago: 'DIGITAL', monto: 5.00, horaAbordaje: '07:29 AM' },
      { ticketId: 'tk-103', nombre: 'Edwin Morales', asiento: 5, paradaSubida: 'Mercado Municipal', paradaBajada: 'Villa Nueva', pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
      { ticketId: 'tk-104', nombre: 'Lucía Hernández', asiento: 6, paradaSubida: 'Mercado Municipal', paradaBajada: 'Naciones Unidas', pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
      { ticketId: 'tk-105', nombre: 'Ramiro Quezada', asiento: 12, paradaSubida: 'Parque Central', paradaBajada: 'Villa Nueva', pagoEstado: 'PAGADO', metodoPago: 'EFECTIVO', monto: 5.00, horaAbordaje: '07:31 AM' },
      { ticketId: 'tk-106', nombre: 'Karla Castillo', asiento: 14, paradaSubida: 'Mercado Municipal', paradaBajada: 'Villa Nueva', pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
      { ticketId: 'tk-107', nombre: 'Diego Palacios', asiento: 18, paradaSubida: 'Parque Central', paradaBajada: 'Villa Nueva', pagoEstado: 'PAGADO', metodoPago: 'DIGITAL', monto: 5.00, horaAbordaje: '07:30 AM' },
      { ticketId: 'tk-108', nombre: 'Gladys Monroy', asiento: 20, paradaSubida: 'Mercado Municipal', paradaBajada: 'Bárcenas', pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
    ],
  });

  // Ganancias del Día (F7)
  readonly cobrosHistorial = signal<ChoferCobroRecord[]>([
    { id: 'cob-1', ticketId: 'tk-088', pasajeroNombre: 'Fernando Solís', asiento: 8, monto: 5.00, metodo: 'EFECTIVO', hora: '06:15 AM' },
    { id: 'cob-2', ticketId: 'tk-089', pasajeroNombre: 'Elena Garrido', asiento: 11, monto: 5.00, metodo: 'EFECTIVO', hora: '06:22 AM' },
    { id: 'cob-3', ticketId: 'tk-090', pasajeroNombre: 'Mariela Chaclán', asiento: 15, monto: 5.00, metodo: 'DIGITAL', hora: '06:25 AM' },
    { id: 'cob-4', ticketId: 'tk-091', pasajeroNombre: 'Byron Rosales', asiento: 22, monto: 5.00, metodo: 'DIGITAL', hora: '06:30 AM' },
    { id: 'cob-5', ticketId: 'tk-105', pasajeroNombre: 'Ramiro Quezada', asiento: 12, monto: 5.00, metodo: 'EFECTIVO', hora: '07:31 AM' },
  ]);

  // Historial de viajes anteriores
  readonly viajesHistorial = signal<ChoferHistoricalTrip[]>([
    { id: 'vh-1', fecha: 'Hoy - 06:00 AM', rutaNombre: 'Amatitlán → Villa Nueva', busPlaca: 'M-101ABC', horaInicio: '06:00 AM', horaFin: '06:40 AM', pasajerosTotales: 32, totalRecaudado: 160.00, estado: 'COMPLETADO' },
    { id: 'vh-2', fecha: 'Ayer - 05:30 PM', rutaNombre: 'Villa Nueva → Amatitlán', busPlaca: 'M-101ABC', horaInicio: '05:30 PM', horaFin: '06:15 PM', pasajerosTotales: 38, totalRecaudado: 190.00, estado: 'COMPLETADO' },
    { id: 'vh-3', fecha: 'Ayer - 01:00 PM', rutaNombre: 'Amatitlán → Villa Nueva', busPlaca: 'M-101ABC', horaInicio: '01:00 PM', horaFin: '01:38 PM', pasajerosTotales: 27, totalRecaudado: 135.00, estado: 'COMPLETADO' },
  ]);

  /**
   * Inicia el viaje asignado (F4)
   */
  startTrip() {
    const current = this.activeTrip();
    this.activeTrip.set({
      ...current,
      estado: 'EN_CURSO',
      siguienteParada: current.paradas.length > 1 ? current.paradas[1].nombre : current.siguienteParada,
      paradas: current.paradas.map((p, idx) => {
        if (idx === 0) return { ...p, estado: 'COMPLETADA' };
        if (idx === 1) return { ...p, estado: 'ACTUAL' };
        return p;
      }),
    });
    this.gps.setBusTripStatus(current.busId, 'ACTIVO');
  }

  /**
   * Inicia o programa un nuevo viaje para el chofer
   */
  startNewTrip(rutaId = 'r1') {
    const rutasDisponibles: Record<string, { rutaNombre: string; origen: string; destino: string }> = {
      'r1': { rutaNombre: 'Amatitlán → Villa Nueva', origen: 'Parque Central Amatitlán', destino: 'Centro de Villa Nueva' },
      'r2': { rutaNombre: 'Villa Nueva → Zona 12', origen: 'Centro de Villa Nueva', destino: 'Estación Trébol Zona 12' },
      'r3': { rutaNombre: 'Amatitlán → Villa Nueva → Mixco', origen: 'Amatitlán', destino: 'Mixco Centro' },
    };
    const info = rutasDisponibles[rutaId] || rutasDisponibles['r1'];
    const now = new Date();
    const horaSalida = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeTrip.set({
      id: `trip-${Date.now()}`,
      rutaId,
      rutaNombre: info.rutaNombre,
      origen: info.origen,
      destino: info.destino,
      busId: 'b1',
      busPlaca: this.choferProfile().busAsignado || 'M-101ABC',
      horaSalida,
      estado: 'EN_CURSO',
      capacidad: 40,
      ocupacionActual: 18,
      etaDestinoMinutos: 35,
      siguienteParada: 'Mercado Municipal Amatitlán',
      paradas: [
        { id: `sp-1-${Date.now()}`, nombre: info.origen, orden: 1, horaEstimada: horaSalida, estado: 'COMPLETADA', pasajerosSuben: 18, pasajerosBajan: 0 },
        { id: `sp-2-${Date.now()}`, nombre: 'Mercado Municipal Amatitlán', orden: 2, horaEstimada: 'En 12 min', estado: 'ACTUAL', pasajerosSuben: 8, pasajerosBajan: 2 },
        { id: `sp-3-${Date.now()}`, nombre: 'CA-9 Sur Km 29', orden: 3, horaEstimada: 'En 20 min', estado: 'PENDIENTE', pasajerosSuben: 4, pasajerosBajan: 1 },
        { id: `sp-4-${Date.now()}`, nombre: info.destino, orden: 4, horaEstimada: 'En 35 min', estado: 'PENDIENTE', pasajerosSuben: 0, pasajerosBajan: 27 },
      ],
      pasajeros: [
        { ticketId: `tk-${Math.floor(100 + Math.random() * 900)}`, nombre: 'Jorge David Pérez', asiento: 1, paradaSubida: info.origen, paradaBajada: info.destino, pagoEstado: 'PAGADO', metodoPago: 'DIGITAL', monto: 5.00 },
        { ticketId: `tk-${Math.floor(100 + Math.random() * 900)}`, nombre: 'María Fernanda Cruz', asiento: 2, paradaSubida: info.origen, paradaBajada: info.destino, pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
        { ticketId: `tk-${Math.floor(100 + Math.random() * 900)}`, nombre: 'Rodrigo Gómez', asiento: 3, paradaSubida: info.origen, paradaBajada: 'CA-9 Sur Km 29', pagoEstado: 'PAGADO', metodoPago: 'EFECTIVO', monto: 5.00 },
        { ticketId: `tk-${Math.floor(100 + Math.random() * 900)}`, nombre: 'Carla Marroquín', asiento: 5, paradaSubida: info.origen, paradaBajada: info.destino, pagoEstado: 'PENDIENTE', metodoPago: 'PENDIENTE', monto: 5.00 },
        { ticketId: `tk-${Math.floor(100 + Math.random() * 900)}`, nombre: 'Manuel Solares', asiento: 8, paradaSubida: info.origen, paradaBajada: info.destino, pagoEstado: 'PAGADO', metodoPago: 'DIGITAL', monto: 5.00 },
      ],
    });
    this.gps.setBusTripStatus('b1', 'ACTIVO');
  }

  /**
   * Finaliza el viaje asignado (F4)
   */
  finishTrip() {
    const current = this.activeTrip();
    this.activeTrip.set({
      ...current,
      estado: 'FINALIZADO',
      ocupacionActual: 0,
      etaDestinoMinutos: 0,
    });
    this.gps.setBusTripStatus(current.busId, 'DETENIDO');

    // Registrar en historial
    const newHistory: ChoferHistoricalTrip = {
      id: `vh-${Date.now()}`,
      fecha: 'Hoy - ' + current.horaSalida,
      rutaNombre: current.rutaNombre,
      busPlaca: current.busPlaca,
      horaInicio: current.horaSalida,
      horaFin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pasajerosTotales: current.pasajeros.length,
      totalRecaudado: current.pasajeros.filter((p) => p.pagoEstado === 'PAGADO').reduce((acc, p) => acc + p.monto, 0),
      estado: 'COMPLETADO',
    };
    this.viajesHistorial.set([newHistory, ...this.viajesHistorial()]);
  }

  /**
   * Cobro en efectivo (F5): Buscar pasajero, registrar cobro, ticket a PAGADO
   */
  registerCashPayment(ticketId: string, monto = 5.00): boolean {
    const trip = this.activeTrip();
    const pasajero = trip.pasajeros.find((p) => p.ticketId === ticketId);
    if (!pasajero) return false;

    // Actualizar estado del pasajero a PAGADO
    const updatedPasajeros = trip.pasajeros.map((p) => {
      if (p.ticketId === ticketId) {
        return {
          ...p,
          pagoEstado: 'PAGADO' as const,
          metodoPago: 'EFECTIVO' as const,
          monto,
          horaAbordaje: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return p;
    });

    this.activeTrip.set({
      ...trip,
      pasajeros: updatedPasajeros,
    });

    // Registrar en ganancias del chofer (F7)
    const nuevoCobro: ChoferCobroRecord = {
      id: `cob-${Date.now()}`,
      ticketId,
      pasajeroNombre: pasajero.nombre,
      asiento: pasajero.asiento,
      monto,
      metodo: 'EFECTIVO',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.cobrosHistorial.set([nuevoCobro, ...this.cobrosHistorial()]);
    return true;
  }

  /**
   * Resumen de ganancias del día (F7)
   */
  getGananciasSummary() {
    const cobros = this.cobrosHistorial();
    const totalEfectivo = cobros
      .filter((c) => c.metodo === 'EFECTIVO')
      .reduce((sum, c) => sum + c.monto, 0);

    const totalDigital = cobros
      .filter((c) => c.metodo === 'DIGITAL')
      .reduce((sum, c) => sum + c.monto, 0);

    const totalGeneral = totalEfectivo + totalDigital;
    const totalPasajeros = cobros.length;

    return {
      totalGeneral,
      totalEfectivo,
      totalDigital,
      totalPasajeros,
    };
  }

  /**
   * Reportar Incidencia (F6)
   */
  reportIncident(dto: Omit<CreateIncidentDto, 'tripId' | 'busId'>): Incident {
    const current = this.activeTrip();
    return this.gps.reportIncident(
      {
        ...dto,
        tripId: current.id,
        busId: current.busId,
      },
      this.choferProfile().nombre
    );
  }
}
