export type TicketEstado = 'RESERVADO' | 'PAGADO' | 'ABORDADO' | 'CANCELADO' | 'NO_SHOW';
export type PagoMetodo = 'EFECTIVO' | 'TARJETA' | 'CUENTA_BANCARIA';

export interface Ticket {
  id: string;
  tripId: string;
  pasajeroId: string;
  asiento: number;
  paradaSubidaId?: string;
  paradaBajadaId?: string;
  precio: number;
  estado: TicketEstado;
  qrCode: string;
  codigoAbordaje?: string;
  abordadoEn?: string;
  createdAt: string;
  updatedAt: string;

  // Campos "derivados" que el frontend arma por su cuenta al mostrar
  routeName?: string;
  boardingStopName?: string;
  alightingStopName?: string;
  qrDataUrl?: string;
}

export interface CreateTicketDto {
  tripId: string;
  asiento: number;
  paradaSubidaId: string;
  paradaBajadaId: string;
}

export interface CreatePagoDto {
  metodo: PagoMetodo;
}