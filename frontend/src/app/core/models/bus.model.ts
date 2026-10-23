export type BusEstado = 'ACTIVO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';

export interface Bus {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidad: number;
  filas: number;
  columnas: number;
  estado: BusEstado;
  fotoUrl?: string;
}