export interface Bus {
  id: string;
  placa: string;
  capacidad: number;
  modelo: string;
  anio: number;
  estado: 'ACTIVO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';
}