export type TripEstado = 'PROGRAMADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  choferId: string;
  fechaSalida: string;
  fechaLlegada?: string;
  estado: TripEstado;
  asientosOcupados: number;
  etaMin?: number;
  createdAt: string;
  updatedAt: string;
}