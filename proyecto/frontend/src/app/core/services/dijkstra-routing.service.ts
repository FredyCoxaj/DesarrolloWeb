import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RoadNode {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

export interface RoadEdge {
  from: string;
  to: string;
  calle: string;
  distanciaKm: number;
  puntos: [number, number][]; // Lat, Lng siguiendo calles reales
}

/**
 * Servicio de Enrutamiento con Dijkstra para RutaBus GT (Frontend)
 * Modela las calles y avenidas reales de Amatitlán, Villa Nueva, San Miguel Petapa,
 * Mixco y Calzada Aguilar Batres / Zona 12, permitiendo que la simulación de buses
 * siga estrictamente el asfalto y curvas de las carreteras.
 */
@Injectable({ providedIn: 'root' })
export class DijkstraRoutingService {
  private http = inject(HttpClient, { optional: true });

  // Red de intersecciones viales
  private readonly nodes: Record<string, RoadNode> = {
    // Amatitlán
    amatitlan_parque: { id: 'amatitlan_parque', nombre: 'Parque Central Amatitlán', lat: 14.4771, lng: -90.6346 },
    amatitlan_calle2: { id: 'amatitlan_calle2', nombre: '2da Calle y 2da Ave', lat: 14.4785, lng: -90.6335 },
    amatitlan_mercado: { id: 'amatitlan_mercado', nombre: 'Mercado Municipal Amatitlán', lat: 14.4795, lng: -90.6320 },
    amatitlan_calle_real: { id: 'amatitlan_calle_real', nombre: 'Calle Real Amatitlán', lat: 14.4812, lng: -90.6295 },
    amatitlan_puente: { id: 'amatitlan_puente', nombre: 'Puente Amatitlán / Río Villalobos', lat: 14.4820, lng: -90.6280 },
    amatitlan_calzada_asuncion: { id: 'amatitlan_calzada_asuncion', nombre: 'Calzada Asunción', lat: 14.4815, lng: -90.6235 },
    amatitlan_hospital: { id: 'amatitlan_hospital', nombre: 'Hospital Nacional Amatitlán', lat: 14.4830, lng: -90.6180 },
    amatitlan_morlon_cruce: { id: 'amatitlan_morlon_cruce', nombre: 'Cruce El Morlón', lat: 14.4845, lng: -90.6240 },

    // CA-9 Sur (Carretera al Pacífico)
    ca9_km30: { id: 'ca9_km30', nombre: 'CA-9 Sur Km 30', lat: 14.4865, lng: -90.6210 },
    ca9_km29: { id: 'ca9_km29', nombre: 'CA-9 Sur Km 29', lat: 14.4920, lng: -90.6150 },
    ca9_km28: { id: 'ca9_km28', nombre: 'CA-9 Sur Km 28', lat: 14.4975, lng: -90.6095 },
    ca9_km26: { id: 'ca9_km26', nombre: 'CA-9 Sur Km 26', lat: 14.5015, lng: -90.6050 },
    ca9_km25: { id: 'ca9_km25', nombre: 'CA-9 Sur Km 25 / Naciones Unidas', lat: 14.5050, lng: -90.6020 },
    ca9_km23: { id: 'ca9_km23', nombre: 'CA-9 Sur Km 23', lat: 14.5095, lng: -90.5975 },
    ca9_barcenas: { id: 'ca9_barcenas', nombre: 'CA-9 Sur Pasarela Bárcenas', lat: 14.5150, lng: -90.5925 },
    ca9_catalina: { id: 'ca9_catalina', nombre: 'CA-9 Sur Cruce Catalina', lat: 14.5210, lng: -90.5890 },
    ca9_villanueva_cruce: { id: 'ca9_villanueva_cruce', nombre: 'Entrada 1ra Calle Villa Nueva', lat: 14.5240, lng: -90.5880 },

    // Villa Nueva Centro & Aguilar Batres
    vn_parque_central: { id: 'vn_parque_central', nombre: 'Parque Central Villa Nueva', lat: 14.5264, lng: -90.5875 },
    vn_3calle: { id: 'vn_3calle', nombre: '3ra Calle Villa Nueva', lat: 14.5285, lng: -90.5860 },
    vn_mercado: { id: 'vn_mercado', nombre: 'Mercado Villa Nueva', lat: 14.5310, lng: -90.5840 },
    vn_santa_clara: { id: 'vn_santa_clara', nombre: 'Santa Clara / CA-9 Km 17', lat: 14.5380, lng: -90.5790 },
    aguilar_batres_km15: { id: 'aguilar_batres_km15', nombre: 'Aguilar Batres Km 15 (Villalobos)', lat: 14.5450, lng: -90.5750 },
    aguilar_batres_castanas: { id: 'aguilar_batres_castanas', nombre: 'Castañas', lat: 14.5530, lng: -90.5710 },
    aguilar_batres_centrasur: { id: 'aguilar_batres_centrasur', nombre: 'Centra Sur / CENMA', lat: 14.5610, lng: -90.5650 },
    aguilar_batres_montemaria: { id: 'aguilar_batres_montemaria', nombre: 'Monte María', lat: 14.5720, lng: -90.5570 },
    aguilar_batres_35calle: { id: 'aguilar_batres_35calle', nombre: 'Aguilar Batres y 35 Calle', lat: 14.5820, lng: -90.5500 },
    aguilar_batres_trebol_z12: { id: 'aguilar_batres_trebol_z12', nombre: 'Trébol Sur / USAC Zona 12', lat: 14.5950, lng: -90.5400 },

    // San Miguel Petapa & Conexiones
    petapa_carmen: { id: 'petapa_carmen', nombre: 'Colonia El Carmen', lat: 14.4890, lng: -90.6100 },
    petapa_villa_canales_cruce: { id: 'petapa_villa_canales_cruce', nombre: 'Cruce Villa Canales - Petapa', lat: 14.4980, lng: -90.5850 },
    petapa_centro: { id: 'petapa_centro', nombre: 'Parque Central San Miguel Petapa', lat: 14.5050, lng: -90.5630 },
    petapa_mercado: { id: 'petapa_mercado', nombre: 'Mercado Petapa', lat: 14.5120, lng: -90.5660 },
    petapa_frutal: { id: 'petapa_frutal', nombre: 'Boulevard El Frutal', lat: 14.5200, lng: -90.5730 },
    petapa_villa_hermosa: { id: 'petapa_villa_hermosa', nombre: 'Villa Hermosa', lat: 14.5350, lng: -90.5680 },

    // Mixco (Vía San Cristóbal)
    mixco_periferico_sur: { id: 'mixco_periferico_sur', nombre: 'Paso Desnivel Villalobos - San Cristóbal', lat: 14.5450, lng: -90.5800 },
    mixco_granjas: { id: 'mixco_granjas', nombre: 'Granjas San Cristóbal', lat: 14.5600, lng: -90.5880 },
    mixco_san_cristobal_sur: { id: 'mixco_san_cristobal_sur', nombre: 'Boulevard Sur San Cristóbal', lat: 14.5750, lng: -90.5920 },
    mixco_san_cristobal_centro: { id: 'mixco_san_cristobal_centro', nombre: 'Centro San Cristóbal', lat: 14.5950, lng: -90.5980 },
    mixco_roosevelt_cruce: { id: 'mixco_roosevelt_cruce', nombre: 'Calzada Roosevelt y El Campanero', lat: 14.6150, lng: -90.6040 },
    mixco_centro: { id: 'mixco_centro', nombre: 'Parque Central Mixco', lat: 14.6340, lng: -90.6067 },
  };

  private readonly edges: RoadEdge[] = [];
  private readonly graph: Record<string, Record<string, number>> = {};
  private readonly routeCache = new Map<string, [number, number][]>();

  constructor() {
    this.initRoadNetwork();
  }

  private initRoadNetwork() {
    // 1. Amatitlán Centro a CA-9
    this.addEdge('amatitlan_parque', 'amatitlan_calle2', '3ra Avenida / 2da Calle', [
      [14.4771, -90.6346],
      [14.4778, -90.6340],
      [14.4785, -90.6335],
    ]);
    this.addEdge('amatitlan_calle2', 'amatitlan_mercado', '2da Calle Oriente', [
      [14.4785, -90.6335],
      [14.4790, -90.6328],
      [14.4795, -90.6320],
    ]);
    this.addEdge('amatitlan_mercado', 'amatitlan_calle_real', 'Calle Real de Amatitlán', [
      [14.4795, -90.6320],
      [14.4802, -90.6308],
      [14.4812, -90.6295],
    ]);
    this.addEdge('amatitlan_calle_real', 'amatitlan_puente', 'Paso Río Villalobos', [
      [14.4812, -90.6295],
      [14.4816, -90.6288],
      [14.4820, -90.6280],
    ]);
    this.addEdge('amatitlan_puente', 'amatitlan_morlon_cruce', 'Calzada Lago El Morlón', [
      [14.4820, -90.6280],
      [14.4832, -90.6260],
      [14.4845, -90.6240],
    ]);
    this.addEdge('amatitlan_morlon_cruce', 'ca9_km30', 'Incorporación CA-9 Sur', [
      [14.4845, -90.6240],
      [14.4855, -90.6225],
      [14.4865, -90.6210],
    ]);

    // Ruta Interna Hospital
    this.addEdge('amatitlan_puente', 'amatitlan_calzada_asuncion', 'Calzada Asunción', [
      [14.4820, -90.6280],
      [14.4818, -90.6255],
      [14.4815, -90.6235],
    ]);
    this.addEdge('amatitlan_calzada_asuncion', 'amatitlan_hospital', 'Acceso Hospital Amatitlán', [
      [14.4815, -90.6235],
      [14.4822, -90.6205],
      [14.4830, -90.6180],
    ]);

    // 2. Corredor CA-9 Sur (Autopista al Pacífico)
    this.addEdge('ca9_km30', 'ca9_km29', 'CA-9 Sur Km 30-29', [
      [14.4865, -90.6210],
      [14.4890, -90.6180],
      [14.4920, -90.6150],
    ]);
    this.addEdge('ca9_km29', 'ca9_km28', 'CA-9 Sur Km 29-28', [
      [14.4920, -90.6150],
      [14.4950, -90.6120],
      [14.4975, -90.6095],
    ]);
    this.addEdge('ca9_km28', 'ca9_km26', 'CA-9 Sur Km 28-26', [
      [14.4975, -90.6095],
      [14.4995, -90.6070],
      [14.5015, -90.6050],
    ]);
    this.addEdge('ca9_km26', 'ca9_km25', 'CA-9 Sur Km 26-25 (Naciones Unidas)', [
      [14.5015, -90.6050],
      [14.5035, -90.6035],
      [14.5050, -90.6020],
    ]);
    this.addEdge('ca9_km25', 'ca9_km23', 'CA-9 Sur Km 25-23', [
      [14.5050, -90.6020],
      [14.5075, -90.5995],
      [14.5095, -90.5975],
    ]);
    this.addEdge('ca9_km23', 'ca9_barcenas', 'CA-9 Sur Pasarela Bárcenas', [
      [14.5095, -90.5975],
      [14.5125, -90.5945],
      [14.5150, -90.5925],
    ]);
    this.addEdge('ca9_barcenas', 'ca9_catalina', 'CA-9 Sur Cruce Catalina', [
      [14.5150, -90.5925],
      [14.5180, -90.5905],
      [14.5210, -90.5890],
    ]);
    this.addEdge('ca9_catalina', 'ca9_villanueva_cruce', 'CA-9 Sur Entrada Villa Nueva', [
      [14.5210, -90.5890],
      [14.5228, -90.5885],
      [14.5240, -90.5880],
    ]);

    // 3. Villa Nueva Centro
    this.addEdge('ca9_villanueva_cruce', 'vn_parque_central', '1ra Calle Villa Nueva', [
      [14.5240, -90.5880],
      [14.5252, -90.5878],
      [14.5264, -90.5875],
    ]);
    this.addEdge('vn_parque_central', 'vn_3calle', '3ra Calle Villa Nueva', [
      [14.5264, -90.5875],
      [14.5275, -90.5868],
      [14.5285, -90.5860],
    ]);
    this.addEdge('vn_3calle', 'vn_mercado', 'Paso Mercado Villa Nueva', [
      [14.5285, -90.5860],
      [14.5298, -90.5850],
      [14.5310, -90.5840],
    ]);
    this.addEdge('vn_mercado', 'vn_santa_clara', 'Blvd Catalina a Santa Clara', [
      [14.5310, -90.5840],
      [14.5345, -90.5815],
      [14.5380, -90.5790],
    ]);
    this.addEdge('ca9_villanueva_cruce', 'vn_santa_clara', 'CA-9 Tramo Santa Clara', [
      [14.5240, -90.5880],
      [14.5310, -90.5835],
      [14.5380, -90.5790],
    ]);

    // 4. Calzada Aguilar Batres hacia Zona 12
    this.addEdge('vn_santa_clara', 'aguilar_batres_km15', 'Cuesta Villalobos (CA-9)', [
      [14.5380, -90.5790],
      [14.5415, -90.5770],
      [14.5450, -90.5750],
    ]);
    this.addEdge('aguilar_batres_km15', 'aguilar_batres_castanas', 'Calzada Aguilar Batres Castañas', [
      [14.5450, -90.5750],
      [14.5490, -90.5730],
      [14.5530, -90.5710],
    ]);
    this.addEdge('aguilar_batres_castanas', 'aguilar_batres_centrasur', 'Aguilar Batres Centra Sur', [
      [14.5530, -90.5710],
      [14.5570, -90.5680],
      [14.5610, -90.5650],
    ]);
    this.addEdge('aguilar_batres_centrasur', 'aguilar_batres_montemaria', 'Aguilar Batres Monte María', [
      [14.5610, -90.5650],
      [14.5665, -90.5610],
      [14.5720, -90.5570],
    ]);
    this.addEdge('aguilar_batres_montemaria', 'aguilar_batres_35calle', 'Aguilar Batres y 35 Calle', [
      [14.5720, -90.5570],
      [14.5770, -90.5535],
      [14.5820, -90.5500],
    ]);
    this.addEdge('aguilar_batres_35calle', 'aguilar_batres_trebol_z12', 'Aguilar Batres Trébol Sur USAC', [
      [14.5820, -90.5500],
      [14.5885, -90.5450],
      [14.5950, -90.5400],
    ]);

    // 5. San Miguel Petapa & Conexiones
    this.addEdge('ca9_km28', 'petapa_carmen', 'Carretera a Colonia El Carmen', [
      [14.4975, -90.6095],
      [14.4930, -90.6098],
      [14.4890, -90.6100],
    ]);
    this.addEdge('petapa_carmen', 'petapa_villa_canales_cruce', 'Carretera El Carmen - Petapa', [
      [14.4890, -90.6100],
      [14.4935, -90.5975],
      [14.4980, -90.5850],
    ]);
    this.addEdge('petapa_villa_canales_cruce', 'petapa_centro', 'Ingreso Petapa Centro', [
      [14.4980, -90.5850],
      [14.5015, -90.5740],
      [14.5050, -90.5630],
    ]);
    this.addEdge('petapa_centro', 'petapa_mercado', '1ra Calle Petapa Centro', [
      [14.5050, -90.5630],
      [14.5085, -90.5645],
      [14.5120, -90.5660],
    ]);
    this.addEdge('petapa_mercado', 'petapa_frutal', 'Boulevard El Frutal', [
      [14.5120, -90.5660],
      [14.5160, -90.5695],
      [14.5200, -90.5730],
    ]);
    this.addEdge('petapa_frutal', 'petapa_villa_hermosa', 'Conexión Villa Hermosa', [
      [14.5200, -90.5730],
      [14.5275, -90.5705],
      [14.5350, -90.5680],
    ]);
    this.addEdge('petapa_villa_hermosa', 'aguilar_batres_centrasur', 'Conexión CENMA / Villalobos', [
      [14.5350, -90.5680],
      [14.5480, -90.5665],
      [14.5610, -90.5650],
    ]);

    // 6. Conexión hacia Mixco (San Cristóbal)
    this.addEdge('aguilar_batres_km15', 'mixco_periferico_sur', 'Conexión Sur San Cristóbal', [
      [14.5450, -90.5750],
      [14.5450, -90.5775],
      [14.5450, -90.5800],
    ]);
    this.addEdge('mixco_periferico_sur', 'mixco_granjas', 'Boulevard Granjas', [
      [14.5450, -90.5800],
      [14.5525, -90.5840],
      [14.5600, -90.5880],
    ]);
    this.addEdge('mixco_granjas', 'mixco_san_cristobal_sur', 'Boulevard Sur San Cristóbal', [
      [14.5600, -90.5880],
      [14.5675, -90.5900],
      [14.5750, -90.5920],
    ]);
    this.addEdge('mixco_san_cristobal_sur', 'mixco_san_cristobal_centro', 'Boulevard Principal San Cristóbal', [
      [14.5750, -90.5920],
      [14.5850, -90.5950],
      [14.5950, -90.5980],
    ]);
    this.addEdge('mixco_san_cristobal_centro', 'mixco_roosevelt_cruce', 'Paso El Campanero / Roosevelt', [
      [14.5950, -90.5980],
      [14.6050, -90.6010],
      [14.6150, -90.6040],
    ]);
    this.addEdge('mixco_roosevelt_cruce', 'mixco_centro', 'Calzada San Juan a Mixco Centro', [
      [14.6150, -90.6040],
      [14.6245, -90.6053],
      [14.6340, -90.6067],
    ]);
  }

  private addEdge(from: string, to: string, calle: string, puntos: [number, number][]) {
    const distanciaKm = this.calcularDistanciaPuntos(puntos);
    this.edges.push({ from, to, calle, distanciaKm, puntos });

    if (!this.graph[from]) this.graph[from] = {};
    if (!this.graph[to]) this.graph[to] = {};
    this.graph[from][to] = distanciaKm;
    this.graph[to][from] = distanciaKm;
  }

  private calcularDistanciaPuntos(puntos: [number, number][]): number {
    let total = 0;
    for (let i = 0; i < puntos.length - 1; i++) {
      total += this.haversine(puntos[i][0], puntos[i][1], puntos[i + 1][0], puntos[i + 1][1]);
    }
    return Math.round(total * 1000) / 1000;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // radio de la tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  findClosestNode(lat: number, lng: number): string {
    let closestId = 'amatitlan_parque';
    let minDist = Infinity;

    for (const [id, node] of Object.entries(this.nodes)) {
      const dist = this.haversine(lat, lng, node.lat, node.lng);
      if (dist < minDist) {
        minDist = dist;
        closestId = id;
      }
    }

    return closestId;
  }

  /**
   * Implementación de Dijkstra Shortest Path en el grafo de calles
   */
  dijkstra(startId: string, endId: string): { path: string[]; distance: number } {
    if (startId === endId) {
      return { path: [startId], distance: 0 };
    }

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();

    for (const node of Object.keys(this.nodes)) {
      distances[node] = node === startId ? 0 : Infinity;
      previous[node] = null;
      unvisited.add(node);
    }

    while (unvisited.size > 0) {
      let closestNode: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          closestNode = node;
        }
      }

      if (!closestNode || minDistance === Infinity) break;
      if (closestNode === endId) break;

      unvisited.delete(closestNode);

      const neighbors = this.graph[closestNode] || {};
      for (const [neighbor, weight] of Object.entries(neighbors)) {
        if (unvisited.has(neighbor)) {
          const alt = distances[closestNode] + weight;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = closestNode;
          }
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = endId;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    return {
      path: path[0] === startId ? path : [],
      distance: distances[endId] !== Infinity ? distances[endId] : 0,
    };
  }

  /**
   * Genera el camino siguiendo las calles entre dos puntos A y B usando Dijkstra
   */
  generarCaminoDijkstra(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number }
  ): { distanciaKm: number; camino: [number, number][]; nodos: string[] } {
    const startNode = this.findClosestNode(origen.lat, origen.lng);
    const endNode = this.findClosestNode(destino.lat, destino.lng);

    const { path, distance } = this.dijkstra(startNode, endNode);
    if (path.length === 0) {
      return {
        distanciaKm: this.haversine(origen.lat, origen.lng, destino.lat, destino.lng),
        camino: [
          [origen.lat, origen.lng],
          [destino.lat, destino.lng],
        ],
        nodos: [startNode, endNode],
      };
    }

    const fullCoords: [number, number][] = [];
    fullCoords.push([origen.lat, origen.lng]);

    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];

      const edge = this.edges.find((e) => (e.from === u && e.to === v) || (e.from === v && e.to === u));
      if (edge) {
        const points = edge.from === u ? edge.puntos : [...edge.puntos].reverse();
        points.forEach((pt) => {
          const last = fullCoords[fullCoords.length - 1];
          if (!last || last[0] !== pt[0] || last[1] !== pt[1]) {
            fullCoords.push(pt);
          }
        });
      } else {
        const nNode = this.nodes[v];
        if (nNode) fullCoords.push([nNode.lat, nNode.lng]);
      }
    }

    fullCoords.push([destino.lat, destino.lng]);

    return {
      distanciaKm: Math.round(distance * 100) / 100,
      camino: fullCoords,
      nodos: path,
    };
  }

  /**
   * Genera la ruta completa de calles para una lista de paradas A -> B -> C -> ...
   */
  generarRutaCalles(stops: { lat: number; lng: number }[]): [number, number][] {
    if (!stops || stops.length === 0) return [];
    if (stops.length === 1) return [[stops[0].lat, stops[0].lng]];

    const fullStreetPath: [number, number][] = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const seg = this.generarCaminoDijkstra(stops[i], stops[i + 1]);
      seg.camino.forEach((pt) => {
        const last = fullStreetPath[fullStreetPath.length - 1];
        if (!last || last[0] !== pt[0] || last[1] !== pt[1]) {
          fullStreetPath.push(pt);
        }
      });
    }

    return fullStreetPath;
  }

  /**
   * Subdivide los tramos para que la simulación GPS avance suavemente
   * paso a paso sobre el asfalto (evita saltos grandes).
   */
  densificarCamino(puntos: [number, number][], distanciaPasoMeters = 40): [number, number][] {
    if (puntos.length < 2) return puntos;

    const densificado: [number, number][] = [];

    for (let i = 0; i < puntos.length - 1; i++) {
      const p1 = puntos[i];
      const p2 = puntos[i + 1];

      densificado.push(p1);

      const distKm = this.haversine(p1[0], p1[1], p2[0], p2[1]);
      const distMeters = distKm * 1000;
      const steps = Math.floor(distMeters / distanciaPasoMeters);

      if (steps > 1) {
        for (let s = 1; s <= steps; s++) {
          const factor = s / (steps + 1);
          const interpLat = p1[0] + (p2[0] - p1[0]) * factor;
          const interpLng = p1[1] + (p2[1] - p1[1]) * factor;
          densificado.push([Number(interpLat.toFixed(6)), Number(interpLng.toFixed(6))]);
        }
      }
    }

    densificado.push(puntos[puntos.length - 1]);
    return densificado;
  }

  /**
   * Retorna las coordenadas de calles para cada una de las 4 rutas oficiales,
   * calculadas mediante Dijkstra.
   */
  getRouteStreetCoordinates(routeId: string): [number, number][] {
    if (this.routeCache.has(routeId)) {
      return this.routeCache.get(routeId)!;
    }

    let rawStops: { lat: number; lng: number }[] = [];

    switch (routeId) {
      case 'r1': // Amatitlán → Villa Nueva
        rawStops = [
          { lat: 14.4771, lng: -90.6346 }, // Parque Amatitlán
          { lat: 14.4795, lng: -90.6320 }, // Mercado Amatitlán
          { lat: 14.4820, lng: -90.6280 }, // Puente Amatitlán
          { lat: 14.5050, lng: -90.6020 }, // CA-9 Km 25 Naciones Unidas
          { lat: 14.5264, lng: -90.5875 }, // Parque Central Villa Nueva
        ];
        break;

      case 'r2': // Villa Nueva → Zona 12 USAC
        rawStops = [
          { lat: 14.5264, lng: -90.5875 }, // Parque Central Villa Nueva
          { lat: 14.5380, lng: -90.5790 }, // Santa Clara
          { lat: 14.5530, lng: -90.5710 }, // Castañas
          { lat: 14.5610, lng: -90.5650 }, // Centra Sur
          { lat: 14.5820, lng: -90.5500 }, // Aguilar Batres 35 Calle
          { lat: 14.5950, lng: -90.5400 }, // Trébol Sur / USAC Z12
        ];
        break;

      case 'r3': // Amatitlán → Mixco
        rawStops = [
          { lat: 14.4771, lng: -90.6346 }, // Amatitlán Centro
          { lat: 14.5050, lng: -90.6020 }, // CA-9 Km 25
          { lat: 14.5380, lng: -90.5790 }, // Santa Clara
          { lat: 14.5450, lng: -90.5800 }, // Conexión San Cristóbal
          { lat: 14.5750, lng: -90.5920 }, // Blvd Sur San Cristóbal
          { lat: 14.6150, lng: -90.6040 }, // Roosevelt / Campanero
          { lat: 14.6340, lng: -90.6067 }, // Mixco Centro
        ];
        break;

      case 'r4': // Amatitlán → San Miguel Petapa
        rawStops = [
          { lat: 14.4771, lng: -90.6346 }, // Amatitlán Parque
          { lat: 14.4890, lng: -90.6100 }, // El Carmen
          { lat: 14.4980, lng: -90.5850 }, // Cruce Villa Canales
          { lat: 14.5050, lng: -90.5630 }, // San Miguel Petapa Centro
        ];
        break;

      default:
        rawStops = [
          { lat: 14.4771, lng: -90.6346 },
          { lat: 14.5264, lng: -90.5875 },
        ];
    }

    const streetPath = this.generarRutaCalles(rawStops);
    const densified = this.densificarCamino(streetPath, 35); // Puntos cada 35 metros para animación fluida

    this.routeCache.set(routeId, densified);
    return densified;
  }
}
