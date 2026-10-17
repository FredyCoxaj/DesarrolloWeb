export interface GpsPosition {
  busId: string;
  placa: string;
  rutaId: string;
  rutaNombre: string;
  lat: number;
  lng: number;
  velocidadKmh: number;
  rumbo?: number; // Heading en grados 0-360
  timestamp: string;
  ocupacion: number;
  capacidad: number;
  estado: 'ACTIVO' | 'MANTENIMIENTO' | 'DETENIDO' | 'FUERA_SERVICIO';
  choferNombre: string;
  siguienteParada?: string;
  etaMinutos?: number;
}

export interface GpsLog {
  id: string;
  busId: string;
  tripId?: string;
  lat: number;
  lng: number;
  velocidadKmh: number;
  fecha: string;
}
