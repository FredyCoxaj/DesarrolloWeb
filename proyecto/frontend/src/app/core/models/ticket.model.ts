export interface Ticket {
  id: string;
  tripId: string;
  routeId: string;
  routeName: string;
  asiento: number;
  boardingStopId: string;
  boardingStopName: string;
  alightingStopId: string;
  alightingStopName: string;
  estado: 'RESERVADO' | 'PAGADO' | 'ABORDADO' | 'CANCELADO';
  qrDataUrl?: string;
  fecha: string;
  precio: number;
}

export interface CreateTicketDto {
  tripId: string;
  asiento: number;
  boardingStopId: string;
  alightingStopId: string;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'CUENTA';
}