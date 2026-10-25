import { BusRevenueSummary } from '../../../core/services/admin.service';

/**
 * Datos simulados para Reportes & Ingresos.
 * El backend aún no tiene un endpoint de reportes, así que se genera un histórico diario
 * a partir de los resúmenes de AdminService. Siempre produce los mismos valores.
 */

export type CategoriaIncidente = 'TRAFICO' | 'MECANICA' | 'USUARIO';
export type Severidad = 'ALTA' | 'MEDIA' | 'BAJA';

export interface RegistroDiario {
  fecha: string; // YYYY-MM-DD
  busId: string;
  ingresos: number;
  viajes: number;
}

export interface Incidente {
  id: string;
  fecha: string; // YYYY-MM-DD
  busId: string;
  categoria: CategoriaIncidente;
  severidad: Severidad;
  descripcion: string;
}

/** Días de histórico generados (cubre "Año a la fecha" y rangos personalizados). */
export const DIAS_HISTORIAL = 400;

export const MUNICIPIOS = ['Amatitlán', 'Villa Nueva', 'Petapa', 'Mixco', 'Zona 12'];

const DESCRIPCIONES: Record<CategoriaIncidente, string[]> = {
  TRAFICO: ['Congestión severa en CA-9', 'Accidente vial en la ruta', 'Cierre de calle por trabajos', 'Retraso mayor a 45 minutos'],
  MECANICA: ['Falla en el sistema de frenos', 'Sobrecalentamiento del motor', 'Pinchazo de llanta', 'Falla eléctrica en el tablero'],
  USUARIO: ['Reserva cancelada por el pasajero', 'Pasajero no se presentó', 'Cambio de planes del usuario'],
};

/** Fecha local en formato YYYY-MM-DD (toISOString usaría UTC y cambiaría el día). */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + dias));
}

/** Pseudoaleatorio determinista entre 0 y 1. */
function aleatorio(semilla: number): number {
  const x = Math.sin(semilla) * 10000;
  return x - Math.floor(x);
}

export function generarRegistros(buses: BusRevenueSummary[]): RegistroDiario[] {
  const hoy = toIsoDate(new Date());
  const registros: RegistroDiario[] = [];
  for (let i = 0; i < DIAS_HISTORIAL; i++) {
    const fecha = sumarDias(hoy, -i);
    buses.forEach((bus, b) => {
      const factor = 0.7 + aleatorio(i * 31 + b * 7 + 1) * 0.6;
      registros.push({
        fecha,
        busId: bus.busId,
        ingresos: Math.round((bus.ingresosMes / 30) * factor),
        viajes: Math.max(1, Math.round((bus.viajesMes / 30) * factor)),
      });
    });
  }
  return registros;
}

export function generarIncidentes(buses: BusRevenueSummary[]): Incidente[] {
  const hoy = toIsoDate(new Date());
  const categorias: CategoriaIncidente[] = ['TRAFICO', 'TRAFICO', 'MECANICA', 'USUARIO'];
  const severidades: Severidad[] = ['ALTA', 'MEDIA', 'MEDIA', 'BAJA'];
  const incidentes: Incidente[] = [];

  for (let i = 0; i < DIAS_HISTORIAL; i++) {
    buses.forEach((bus, b) => {
      const semilla = i * 53 + b * 11 + 3;
      if (aleatorio(semilla) > 0.12) return; // ~12% de probabilidad por bus y día
      const categoria = categorias[Math.floor(aleatorio(semilla + 1) * categorias.length)];
      const opciones = DESCRIPCIONES[categoria];
      incidentes.push({
        id: `inc-${bus.busId}-${i}`,
        fecha: sumarDias(hoy, -i),
        busId: bus.busId,
        categoria,
        severidad: severidades[Math.floor(aleatorio(semilla + 2) * severidades.length)],
        descripcion: opciones[Math.floor(aleatorio(semilla + 3) * opciones.length)],
      });
    });
  }
  return incidentes;
}
