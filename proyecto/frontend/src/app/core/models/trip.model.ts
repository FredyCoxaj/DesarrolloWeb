export interface Trip {
  id: string;
  busId: string;
  choferId: string;
  routeId: string;
  horaSalida: string;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  eta?: number;
}