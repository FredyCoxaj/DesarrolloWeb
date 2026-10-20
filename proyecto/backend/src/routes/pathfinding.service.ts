import { Injectable } from '@nestjs/common';
import { GeoShortestPath } from 'geo-shortest-path';

@Injectable()
export class PathfindingService {
  /**
   * Calcula la distancia total de una ruta usando el algoritmo de Dijkstra.
   * Construye un grafo donde los nodos son las paradas y las aristas tienen
   * como peso la distancia Haversine entre ellas. Luego, encuentra el camino
   * más corto entre la primera y la última parada.
   */
  calcularDistanciaRuta(stops: any[]): number {
    if (!stops || stops.length < 2) return 0;

    // 1. Convertir las paradas a un formato que la librería entienda
    const nodes: { [key: string]: { lat: number; lon: number } } = {};
    stops.forEach((stop, index) => {
      nodes[`p${index}`] = { lat: stop.latitud, lon: stop.longitud };
    });

    // 2. Crear el objeto de Dijkstra
    const geoPath = new GeoShortestPath(nodes);

    // 3. Encontrar la ruta más corta desde la primera hasta la última parada
    const primera = 'p0';
    const ultima = `p${stops.length - 1}`;
    const pathInfo = geoPath.findShortestPath(primera, ultima);

    // 4. La distancia viene en metros, la convertimos a kilómetros
    return pathInfo ? Math.round((pathInfo.distance / 1000) * 100) / 100 : 0;
  }

  /**
   * Calcula la distancia total asumiendo el orden secuencial de las paradas
   * (útil para rutas predefinidas donde el orden ya está establecido).
   * Usa Dijkstra para encontrar el camino más corto entre paradas consecutivas.
   */
  calcularDistanciaSecuencial(stops: any[]): number {
    if (!stops || stops.length < 2) return 0;

    let distanciaTotal = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const nodes = {
        A: { lat: stops[i].latitud, lon: stops[i].longitud },
        B: { lat: stops[i + 1].latitud, lon: stops[i + 1].longitud },
      };

      const geoPath = new GeoShortestPath(nodes);
      const pathInfo = geoPath.findShortestPath('A', 'B');

      if (pathInfo) {
        distanciaTotal += pathInfo.distance / 1000; // Convertir a km
      }
    }

    return Math.round(distanciaTotal * 100) / 100;
  }
}