/**
 * Simulador GPS para RutaBus GT (F1 Track C - Renato)
 * 
 * Simula el movimiento continuo de 4 buses por sus rutas oficiales en:
 * Amatitlán, Villa Nueva, San Miguel Petapa, Mixco y Zona 12.
 * Emite coordenadas cada 3 segundos hacia el servidor Socket.io o consola.
 */

import { io, Socket } from 'socket.io-client';

interface BusSimulated {
  id: string;
  placa: string;
  rutaId: string;
  rutaNombre: string;
  choferNombre: string;
  capacidad: number;
  ocupacion: number;
  waypoints: [number, number][];
  currentWaypointIdx: number;
  currentLat: number;
  currentLng: number;
  velocidadKmh: number;
  estado: 'ACTIVO' | 'DETENIDO';
  detenidoContador: number;
}

const SERVER_URL = process.env['WS_URL'] || 'http://localhost:3000';

// Waypoints por tramos reales (Amatitlán - Villa Nueva - Petapa - Mixco - Zona 12)
const BUSES_SIMULADOS: BusSimulated[] = [
  {
    id: 'b1',
    placa: 'M-101ABC',
    rutaId: 'r1',
    rutaNombre: 'Amatitlán → Villa Nueva',
    choferNombre: 'Juan Carlos Gómez',
    capacidad: 40,
    ocupacion: 26,
    waypoints: [
      [14.4769, -90.6347], // Parque Amatitlán
      [14.4805, -90.6280], // Mercado Municipal
      [14.4920, -90.6150], // CA-9 Sur km 29
      [14.5050, -90.6020], // Entrada Naciones Unidas
      [14.5150, -90.5920], // Pasarela Barcenas
      [14.5250, -90.5870], // Entrada Villa Nueva Centro
    ],
    currentWaypointIdx: 0,
    currentLat: 14.4769,
    currentLng: -90.6347,
    velocidadKmh: 42,
    estado: 'ACTIVO',
    detenidoContador: 0,
  },
  {
    id: 'b2',
    placa: 'M-202DEF',
    rutaId: 'r2',
    rutaNombre: 'Villa Nueva → Zona 12',
    choferNombre: 'Mario Estrada López',
    capacidad: 45,
    ocupacion: 34,
    waypoints: [
      [14.5250, -90.5870], // Centro Villa Nueva
      [14.5420, -90.5730], // Castañas
      [14.5600, -90.5610], // Monte María
      [14.5800, -90.5500], // Aguilar Batres y 35 Calle
      [14.5950, -90.5400], // Trébol Sur / Zona 12 USAC
    ],
    currentWaypointIdx: 0,
    currentLat: 14.5250,
    currentLng: -90.5870,
    velocidadKmh: 38,
    estado: 'ACTIVO',
    detenidoContador: 0,
  },
  {
    id: 'b3',
    placa: 'M-303GHI',
    rutaId: 'r3',
    rutaNombre: 'Amatitlán → Mixco',
    choferNombre: 'Roberto Pérez Soto',
    capacidad: 38,
    ocupacion: 18,
    waypoints: [
      [14.4769, -90.6347], // Parque Amatitlán
      [14.5020, -90.5610], // Petapa Centro
      [14.5450, -90.5800], // Conexión San Cristóbal
      [14.5900, -90.5950], // Blvr San Cristóbal
      [14.6350, -90.6100], // Mixco Centro
    ],
    currentWaypointIdx: 0,
    currentLat: 14.4769,
    currentLng: -90.6347,
    velocidadKmh: 45,
    estado: 'ACTIVO',
    detenidoContador: 0,
  },
  {
    id: 'b4',
    placa: 'M-404JKL',
    rutaId: 'r4',
    rutaNombre: 'Amatitlán → San Miguel Petapa',
    choferNombre: 'Estuardo Raxón',
    capacidad: 35,
    ocupacion: 14,
    waypoints: [
      [14.4769, -90.6347], // Parque Amatitlán
      [14.4890, -90.6050], // Villa Canales cruce
      [14.5020, -90.5610], // Centro Petapa
    ],
    currentWaypointIdx: 0,
    currentLat: 14.4769,
    currentLng: -90.6347,
    velocidadKmh: 35,
    estado: 'ACTIVO',
    detenidoContador: 0,
  },
];

console.log('🚍 [RutaBus GT - Simulador GPS] Iniciando...');
console.log(`📡 Conectando a WebSocket: ${SERVER_URL}`);

let socket: Socket | null = null;
try {
  socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log(`✅ Conectado al servidor WebSocket [ID: ${socket?.id}]`);
    // Unirse a sala global de monitoreo
    socket?.emit('join:room', { room: 'buses:all' });
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Desconectado del servidor WebSocket. Reintentando...');
  });
} catch (err) {
  console.log('ℹ️ Modo standalone activo (sin servidor WS activo). Emulando eventos en consola.');
}

// Mover buses cada 3 segundos
setInterval(() => {
  BUSES_SIMULADOS.forEach((bus) => {
    const nextIdx = (bus.currentWaypointIdx + 1) % bus.waypoints.length;
    const targetWp = bus.waypoints[nextIdx];

    // Interpolar paso hacia el siguiente punto
    const step = 0.15;
    bus.currentLat += (targetWp[0] - bus.currentLat) * step;
    bus.currentLng += (targetWp[1] - bus.currentLng) * step;

    // Distancia al punto
    const dist = Math.hypot(targetWp[0] - bus.currentLat, targetWp[1] - bus.currentLng);
    if (dist < 0.001) {
      bus.currentWaypointIdx = nextIdx;
      // Fluctuar ocupación
      bus.ocupacion = Math.max(5, Math.min(bus.capacidad, bus.ocupacion + (Math.random() > 0.5 ? 2 : -2)));
    }

    // Variar velocidad
    bus.velocidadKmh = Math.round(30 + Math.random() * 25);

    const gpsPayload = {
      busId: bus.id,
      placa: bus.placa,
      rutaId: bus.rutaId,
      rutaNombre: bus.rutaNombre,
      lat: Number(bus.currentLat.toFixed(6)),
      lng: Number(bus.currentLng.toFixed(6)),
      velocidadKmh: bus.velocidadKmh,
      ocupacion: bus.ocupacion,
      capacidad: bus.capacidad,
      choferNombre: bus.choferNombre,
      estado: bus.estado,
      timestamp: new Date().toISOString(),
    };

    if (socket && socket.connected) {
      socket.emit('bus:location:update', gpsPayload);
      socket.emit(`bus:${bus.id}:location`, gpsPayload);
    }

    console.log(`[GPS ${new Date().toLocaleTimeString()}] Bus ${bus.placa} (${bus.rutaNombre}) -> Lat: ${gpsPayload.lat}, Lng: ${gpsPayload.lng}, Vel: ${gpsPayload.velocidadKmh} km/h, Ocupación: ${bus.ocupacion}/${bus.capacidad}`);
  });
}, 3000);
