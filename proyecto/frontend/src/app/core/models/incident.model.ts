export type IncidentType = 'TRAFICO' | 'AVERIA' | 'ACCIDENTE' | 'DESVIO' | 'OTRO';
export type IncidentSeverity = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Incident {
  id: string;
  tripId: string;
  busId: string;
  busPlaca?: string;
  choferId: string;
  choferNombre?: string;
  tipo: IncidentType;
  severidad: IncidentSeverity;
  descripcion: string;
  ubicacion?: string;
  lat?: number;
  lng?: number;
  fecha: string;
  atendida: boolean;
}

export interface CreateIncidentDto {
  tripId: string;
  busId: string;
  tipo: IncidentType;
  severidad: IncidentSeverity;
  descripcion: string;
  ubicacion?: string;
  lat?: number;
  lng?: number;
}
