/**
 * Simulador GPS para RutaBus GT (F1 Track C - Renato)
 * 
 * Simula el movimiento continuo de 4 buses por sus rutas oficiales en:
 * Amatitlán, Villa Nueva, San Miguel Petapa, Mixco y Zona 12.
 * Utiliza el Algoritmo de Dijkstra para calcular el camino exacto sobre
 * las calles y autopistas reales, evitando saltos en línea recta.
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
  direction: 1 | -1;
  currentLat: number;
  currentLng: number;
  velocidadKmh: number;
  rumbo: number;
  estado: 'ACTIVO' | 'DETENIDO';
  detenidoContador: number;
}

const SERVER_URL = process.env['WS_URL'] || 'http://localhost:3000';

// ============================================================
// RED VIAL Y ALGORITMO DIJKSTRA
// ============================================================

const NODES: Record<string, { lat: number; lng: number }> = {
  // Amatitlán
  amatitlan_parque: { lat: 14.4771, lng: -90.6346 },
  amatitlan_calle2: { lat: 14.4785, lng: -90.6335 },
  amatitlan_mercado: { lat: 14.4795, lng: -90.6320 },
  amatitlan_calle_real: { lat: 14.4812, lng: -90.6295 },
  amatitlan_puente: { lat: 14.4820, lng: -90.6280 },
  amatitlan_morlon_cruce: { lat: 14.4845, lng: -90.6240 },

  // CA-9 Sur
  ca9_km30: { lat: 14.4865, lng: -90.6210 },
  ca9_km29: { lat: 14.4920, lng: -90.6150 },
  ca9_km28: { lat: 14.4975, lng: -90.6095 },
  ca9_km26: { lat: 14.5015, lng: -90.6050 },
  ca9_km25: { lat: 14.5050, lng: -90.6020 },
  ca9_km23: { lat: 14.5095, lng: -90.5975 },
  ca9_barcenas: { lat: 14.5150, lng: -90.5925 },
  ca9_catalina: { lat: 14.5210, lng: -90.5890 },
  ca9_villanueva_cruce: { lat: 14.5240, lng: -90.5880 },

  // Villa Nueva & Aguilar Batres
  vn_parque_central: { lat: 14.5264, lng: -90.5875 },
  vn_santa_clara: { lat: 14.5380, lng: -90.5790 },
  aguilar_batres_km15: { lat: 14.5450, lng: -90.5750 },
  aguilar_batres_castanas: { lat: 14.5530, lng: -90.5710 },
  aguilar_batres_centrasur: { lat: 14.5610, lng: -90.5650 },
  aguilar_batres_montemaria: { lat: 14.5720, lng: -90.5570 },
  aguilar_batres_35calle: { lat: 14.5820, lng: -90.5500 },
  aguilar_batres_trebol_z12: { lat: 14.5950, lng: -90.5400 },

  // Petapa
  petapa_carmen: { lat: 14.4890, lng: -90.6100 },
  petapa_villa_canales_cruce: { lat: 14.4980, lng: -90.5850 },
  petapa_centro: { lat: 14.5050, lng: -90.5630 },
  petapa_mercado: { lat: 14.5120, lng: -90.5660 },
  petapa_frutal: { lat: 14.5200, lng: -90.5730 },
  petapa_villa_hermosa: { lat: 14.5350, lng: -90.5680 },

  // Mixco
  mixco_periferico_sur: { lat: 14.5450, lng: -90.5800 },
  mixco_granjas: { lat: 14.5600, lng: -90.5880 },
  mixco_san_cristobal_sur: { lat: 14.5750, lng: -90.5920 },
  mixco_san_cristobal_centro: { lat: 14.5950, lng: -90.5980 },
  mixco_roosevelt_cruce: { lat: 14.6150, lng: -90.6040 },
  mixco_centro: { lat: 14.6340, lng: -90.6067 },
};

interface Edge {
  u: string;
  v: string;
  points: [number, number][];
}

const EDGES: Edge[] = [
  // Amatitlán a CA-9
  { u: 'amatitlan_parque', v: 'amatitlan_calle2', points: [[14.4771, -90.6346], [14.4778, -90.6340], [14.4785, -90.6335]] },
  { u: 'amatitlan_calle2', v: 'amatitlan_mercado', points: [[14.4785, -90.6335], [14.4790, -90.6328], [14.4795, -90.6320]] },
  { u: 'amatitlan_mercado', v: 'amatitlan_calle_real', points: [[14.4795, -90.6320], [14.4802, -90.6308], [14.4812, -90.6295]] },
  { u: 'amatitlan_calle_real', v: 'amatitlan_puente', points: [[14.4812, -90.6295], [14.4816, -90.6288], [14.4820, -90.6280]] },
  { u: 'amatitlan_puente', v: 'amatitlan_morlon_cruce', points: [[14.4820, -90.6280], [14.4832, -90.6260], [14.4845, -90.6240]] },
  { u: 'amatitlan_morlon_cruce', v: 'ca9_km30', points: [[14.4845, -90.6240], [14.4855, -90.6225], [14.4865, -90.6210]] },

  // CA-9 Sur
  { u: 'ca9_km30', v: 'ca9_km29', points: [[14.4865, -90.6210], [14.4890, -90.6180], [14.4920, -90.6150]] },
  { u: 'ca9_km29', v: 'ca9_km28', points: [[14.4920, -90.6150], [14.4950, -90.6120], [14.4975, -90.6095]] },
  { u: 'ca9_km28', v: 'ca9_km26', points: [[14.4975, -90.6095], [14.4995, -90.6070], [14.5015, -90.6050]] },
  { u: 'ca9_km26', v: 'ca9_km25', points: [[14.5015, -90.6050], [14.5035, -90.6035], [14.5050, -90.6020]] },
  { u: 'ca9_km25', v: 'ca9_km23', points: [[14.5050, -90.6020], [14.5075, -90.5995], [14.5095, -90.5975]] },
  { u: 'ca9_km23', v: 'ca9_barcenas', points: [[14.5095, -90.5975], [14.5125, -90.5945], [14.5150, -90.5925]] },
  { u: 'ca9_barcenas', v: 'ca9_catalina', points: [[14.5150, -90.5925], [14.5180, -90.5905], [14.5210, -90.5890]] },
  { u: 'ca9_catalina', v: 'ca9_villanueva_cruce', points: [[14.5210, -90.5890], [14.5228, -90.5885], [14.5240, -90.5880]] },
  { u: 'ca9_villanueva_cruce', v: 'vn_parque_central', points: [[14.5240, -90.5880], [14.5252, -90.5878], [14.5264, -90.5875]] },
  { u: 'ca9_villanueva_cruce', v: 'vn_santa_clara', points: [[14.5240, -90.5880], [14.5310, -90.5835], [14.5380, -90.5790]] },

  // Calzada Aguilar Batres
  { u: 'vn_santa_clara', v: 'aguilar_batres_km15', points: [[14.5380, -90.5790], [14.5415, -90.5770], [14.5450, -90.5750]] },
  { u: 'aguilar_batres_km15', v: 'aguilar_batres_castanas', points: [[14.5450, -90.5750], [14.5490, -90.5730], [14.5530, -90.5710]] },
  { u: 'aguilar_batres_castanas', v: 'aguilar_batres_centrasur', points: [[14.5530, -90.5710], [14.5570, -90.5680], [14.5610, -90.5650]] },
  { u: 'aguilar_batres_centrasur', v: 'aguilar_batres_montemaria', points: [[14.5610, -90.5650], [14.5665, -90.5610], [14.5720, -90.5570]] },
  { u: 'aguilar_batres_montemaria', v: 'aguilar_batres_35calle', points: [[14.5720, -90.5570], [14.5770, -90.5535], [14.5820, -90.5500]] },
  { u: 'aguilar_batres_35calle', v: 'aguilar_batres_trebol_z12', points: [[14.5820, -90.5500], [14.5885, -90.5450], [14.5950, -90.5400]] },

  // Petapa
  { u: 'ca9_km28', v: 'petapa_carmen', points: [[14.4975, -90.6095], [14.4930, -90.6098], [14.4890, -90.6100]] },
  { u: 'petapa_carmen', v: 'petapa_villa_canales_cruce', points: [[14.4890, -90.6100], [14.4935, -90.5975], [14.4980, -90.5850]] },
  { u: 'petapa_villa_canales_cruce', v: 'petapa_centro', points: [[14.4980, -90.5850], [14.5015, -90.5740], [14.5050, -90.5630]] },
  { u: 'petapa_centro', v: 'petapa_mercado', points: [[14.5050, -90.5630], [14.5085, -90.5645], [14.5120, -90.5660]] },
  { u: 'petapa_mercado', v: 'petapa_frutal', points: [[14.5120, -90.5660], [14.5160, -90.5695], [14.5200, -90.5730]] },
  { u: 'petapa_frutal', v: 'petapa_villa_hermosa', points: [[14.5200, -90.5730], [14.5275, -90.5705], [14.5350, -90.5680]] },
  { u: 'petapa_villa_hermosa', v: 'aguilar_batres_centrasur', points: [[14.5350, -90.5680], [14.5480, -90.5665], [14.5610, -90.5650]] },

  // Mixco
  { u: 'aguilar_batres_km15', v: 'mixco_periferico_sur', points: [[14.5450, -90.5750], [14.5450, -90.5775], [14.5450, -90.5800]] },
  { u: 'mixco_periferico_sur', v: 'mixco_granjas', points: [[14.5450, -90.5800], [14.5525, -90.5840], [14.5600, -90.5880]] },
  { u: 'mixco_granjas', v: 'mixco_san_cristobal_sur', points: [[14.5600, -90.5880], [14.5675, -90.5900], [14.5750, -90.5920]] },
  { u: 'mixco_san_cristobal_sur', v: 'mixco_san_cristobal_centro', points: [[14.5750, -90.5920], [14.5850, -90.5950], [14.5950, -90.5980]] },
  { u: 'mixco_san_cristobal_centro', v: 'mixco_roosevelt_cruce', points: [[14.5950, -90.5980], [14.6050, -90.6010], [14.6150, -90.6040]] },
  { u: 'mixco_roosevelt_cruce', v: 'mixco_centro', points: [[14.6150, -90.6040], [14.6245, -90.6053], [14.6340, -90.6067]] },
];

function haversine(p1: [number, number], p2: [number, number]): number {
  const R = 6371;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findClosestNode(lat: number, lng: number): string {
  let closest = 'amatitlan_parque';
  let minDist = Infinity;
  for (const [id, n] of Object.entries(NODES)) {
    const d = haversine([lat, lng], [n.lat, n.lng]);
    if (d < minDist) {
      minDist = d;
      closest = id;
    }
  }
  return closest;
}

function dijkstra(start: string, end: string): string[] {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set(Object.keys(NODES));

  for (const n of Object.keys(NODES)) {
    dist[n] = n === start ? 0 : Infinity;
    prev[n] = null;
  }

  while (unvisited.size > 0) {
    let u: string | null = null;
    let minD = Infinity;
    for (const node of unvisited) {
      if (dist[node] < minD) {
        minD = dist[node];
        u = node;
      }
    }
    if (!u || minD === Infinity || u === end) break;
    unvisited.delete(u);

    // Vecinos
    const neighbors = EDGES.filter((e) => e.u === u || e.v === u);
    for (const edge of neighbors) {
      const v = edge.u === u ? edge.v : edge.u;
      if (unvisited.has(v)) {
        const edgeDist = haversine([NODES[edge.u].lat, NODES[edge.u].lng], [NODES[edge.v].lat, NODES[edge.v].lng]);
        const alt = dist[u] + edgeDist;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = end;
  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path[0] === start ? path : [];
}

function getStreetPathBetween(p1: [number, number], p2: [number, number]): [number, number][] {
  const startNode = findClosestNode(p1[0], p1[1]);
  const endNode = findClosestNode(p2[0], p2[1]);
  const path = dijkstra(startNode, endNode);
  if (path.length === 0) return [p1, p2];

  const full: [number, number][] = [p1];
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const edge = EDGES.find((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));
    if (edge) {
      const pts = edge.u === u ? edge.points : [...edge.points].reverse();
      pts.forEach((pt) => full.push(pt));
    }
  }
  full.push(p2);
  return full;
}

function densify(points: [number, number][], stepMeters = 35): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    out.push(a);
    const dMeters = haversine(a, b) * 1000;
    const steps = Math.floor(dMeters / stepMeters);
    for (let s = 1; s <= steps; s++) {
      const f = s / (steps + 1);
      out.push([Number((a[0] + (b[0] - a[0]) * f).toFixed(6)), Number((a[1] + (b[1] - a[1]) * f).toFixed(6))]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// Calcular las 4 rutas por calles reales usando Dijkstra
const r1Street = densify(getStreetPathBetween([14.4771, -90.6346], [14.5264, -90.5875])); // Amatitlán → Villa Nueva
const r2Street = densify(getStreetPathBetween([14.5264, -90.5875], [14.5950, -90.5400])); // Villa Nueva → Z12 USAC
const r3Street = densify(getStreetPathBetween([14.4771, -90.6346], [14.6340, -90.6067])); // Amatitlán → Mixco
const r4Street = densify(getStreetPathBetween([14.4771, -90.6346], [14.5050, -90.5630])); // Amatitlán → Petapa

const BUSES_SIMULADOS: BusSimulated[] = [
  {
    id: 'b1',
    placa: 'M-101ABC',
    rutaId: 'r1',
    rutaNombre: 'Amatitlán → Villa Nueva',
    choferNombre: 'Juan Carlos Gómez',
    capacidad: 40,
    ocupacion: 26,
    waypoints: r1Street,
    currentWaypointIdx: 5,
    direction: 1,
    currentLat: r1Street[5][0],
    currentLng: r1Street[5][1],
    velocidadKmh: 42,
    rumbo: 45,
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
    waypoints: r2Street,
    currentWaypointIdx: 6,
    direction: 1,
    currentLat: r2Street[6][0],
    currentLng: r2Street[6][1],
    velocidadKmh: 38,
    rumbo: 20,
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
    waypoints: r3Street,
    currentWaypointIdx: 10,
    direction: 1,
    currentLat: r3Street[10][0],
    currentLng: r3Street[10][1],
    velocidadKmh: 45,
    rumbo: 320,
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
    waypoints: r4Street,
    currentWaypointIdx: 3,
    direction: 1,
    currentLat: r4Street[3][0],
    currentLng: r4Street[3][1],
    velocidadKmh: 35,
    rumbo: 90,
    estado: 'ACTIVO',
    detenidoContador: 0,
  },
];

console.log('🚍 [RutaBus GT - Simulador GPS] Iniciando con enrutamiento vial Dijkstra...');
console.log(`📍 Rutas calculadas sobre calles reales:`);
console.log(`   - r1 (Amatitlán → Villa Nueva): ${r1Street.length} puntos viales`);
console.log(`   - r2 (Villa Nueva → Zona 12): ${r2Street.length} puntos viales`);
console.log(`   - r3 (Amatitlán → Mixco): ${r3Street.length} puntos viales`);
console.log(`   - r4 (Amatitlán → Petapa): ${r4Street.length} puntos viales`);
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
    socket?.emit('join:room', { room: 'buses:all' });
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Desconectado del servidor WebSocket. Reintentando...');
  });
} catch {
  console.log('ℹ️ Modo standalone activo. Emulando eventos de calles en consola.');
}

// Mover buses cada 3 segundos a lo largo de las calles
setInterval(() => {
  BUSES_SIMULADOS.forEach((bus) => {
    if (bus.estado === 'DETENIDO') return;

    const wps = bus.waypoints;
    let nextIdx = bus.currentWaypointIdx + bus.direction;

    if (nextIdx >= wps.length) {
      bus.direction = -1;
      nextIdx = wps.length - 2;
    } else if (nextIdx < 0) {
      bus.direction = 1;
      nextIdx = 1;
    }

    bus.currentWaypointIdx = nextIdx;
    const prevPt = [bus.currentLat, bus.currentLng];
    const targetWp = wps[nextIdx];
    bus.currentLat = targetWp[0];
    bus.currentLng = targetWp[1];

    // Rumbo respecto a la calle
    const dLng = (targetWp[1] - prevPt[1]) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(targetWp[0] * Math.PI / 180);
    const x = Math.cos(prevPt[0] * Math.PI / 180) * Math.sin(targetWp[0] * Math.PI / 180) - Math.sin(prevPt[0] * Math.PI / 180) * Math.cos(targetWp[0] * Math.PI / 180) * Math.cos(dLng);
    bus.rumbo = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);

    // Fluctúa ocupación y velocidad
    bus.velocidadKmh = Math.round(32 + Math.random() * 18);
    bus.ocupacion = Math.max(5, Math.min(bus.capacidad, bus.ocupacion + (Math.random() > 0.6 ? 1 : -1)));

    const gpsPayload = {
      busId: bus.id,
      placa: bus.placa,
      rutaId: bus.rutaId,
      rutaNombre: bus.rutaNombre,
      lat: bus.currentLat,
      lng: bus.currentLng,
      velocidadKmh: bus.velocidadKmh,
      rumbo: bus.rumbo,
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

    console.log(`[GPS ${new Date().toLocaleTimeString()}] Bus ${bus.placa} (${bus.rutaNombre}) [Calle: ${gpsPayload.lat}, ${gpsPayload.lng}] Vel: ${gpsPayload.velocidadKmh} km/h, Rumbo: ${bus.rumbo}°`);
  });
}, 3000);
