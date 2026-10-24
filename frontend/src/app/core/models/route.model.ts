export interface Stop {
  id: string;
  routeId: string;
  nombre: string;
  latitud: number;
  longitud: number;
  orden: number;
  esTerminal: boolean;
}

export interface Route {
  id: string;
  nombre: string;
  descripcion?: string;
  origen: string;
  destino: string;
  precioBase: number;
  duracionMin: number;
  activa: boolean;
  color: string;
  stops: Stop[];
  imagen?: string;
}