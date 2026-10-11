export type AlertType = 'BUS_DETENIDO' | 'SOBRECUPO' | 'CHOFER_INACTIVO' | 'INCIDENCIA' | 'DESVIO_RUTA';
export type AlertSeverity = 'INFO' | 'WARNING' | 'DANGER';

export interface AdminAlert {
  id: string;
  tipo: AlertType;
  titulo: string;
  mensaje: string;
  severidad: AlertSeverity;
  busId?: string;
  busPlaca?: string;
  choferNombre?: string;
  fecha: string;
  leida: boolean;
  resuelta: boolean;
}
