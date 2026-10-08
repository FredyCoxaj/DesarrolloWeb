export interface Ticket {
  id: string;
  tripId: string;
  asiento: number;
  boardingStopId: string;
  alightingStopId: string;
  estado: 'RESERVADO' | 'PAGADO' | 'ABORDADO' | 'CANCELADO';
  qr: string;
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