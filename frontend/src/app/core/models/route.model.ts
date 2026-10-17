export interface Stop {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  orden: number;
}

export interface Route {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  precio: number;
  duracionMin: number;
  paradas: Stop[];
}