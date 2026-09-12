import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Viaje } from './entities/viaje.entity';
import { Ruta } from './entities/ruta.entity';
import { Reserva } from './entities/reserva.entity';
import { Parada } from './entities/parada.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Viaje)
    private viajeRepository: Repository<Viaje>,
    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Parada)
    private paradaRepository: Repository<Parada>,
  ) {}

  async obtenerRutasActivas() {
    return this.rutaRepository.find({
      where: { estado: 'activo' }
    });
  }

  async buscarViajesDisponibles(fecha: string, rutaId?: string) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const whereCondition: any = {
      fecha_hora_salida: Between(fechaInicio, fechaFin),
      estado: 'programado',
    };

    if (rutaId) {
      whereCondition.ruta_id = rutaId;
    }

    const viajes = await this.viajeRepository.find({
      where: whereCondition,
      order: { fecha_hora_salida: 'ASC' }
    });

    // Obtener nombres de rutas por separado
    const viajesConInfo = await Promise.all(
      viajes.map(async (viaje) => {
        const ruta = await this.rutaRepository.findOne({
          where: { id: viaje.ruta_id }
        });
        
        const reservasConfirmadas = await this.reservaRepository.count({
          where: { 
            viaje_id: viaje.id, 
            estado: 'confirmada' 
          }
        });
        
        return {
          ...viaje,
          nombre_ruta: ruta ? ruta.nombre : 'Sin ruta',
          asientos_disponibles: 40 - reservasConfirmadas,
          asientos_totales: 40,
        };
      })
    );

    return viajesConInfo;
  }

  async obtenerParadas(rutaId: string) {
    const paradas = await this.paradaRepository.find({
      where: { ruta_id: rutaId },
      order: { orden: 'ASC' }
    });

    if (!paradas.length) {
      throw new NotFoundException('No hay paradas para esta ruta');
    }

    return paradas;
  }

  async reservarAsiento(usuarioId: string, viajeId: string, numeroAsiento: number) {
    const viaje = await this.viajeRepository.findOne({
      where: { id: viajeId, estado: 'programado' }
    });

    if (!viaje) {
      throw new NotFoundException('Viaje no encontrado o no disponible');
    }

    const reservasConfirmadas = await this.reservaRepository.count({
      where: { viaje_id: viajeId, estado: 'confirmada' }
    });

    if (reservasConfirmadas >= 40) {
      throw new BadRequestException('No hay asientos disponibles en este viaje');
    }

    const reservaExistente = await this.reservaRepository.findOne({
      where: {
        viaje_id: viajeId,
        numero_asiento: numeroAsiento,
        estado: 'confirmada'
      }
    });

    if (reservaExistente) {
      throw new BadRequestException(`El asiento ${numeroAsiento} ya esta ocupado`);
    }

    const nuevaReserva = this.reservaRepository.create({
      usuario_id: usuarioId,
      viaje_id: viajeId,
      numero_asiento: numeroAsiento,
      estado: 'confirmada'
    });

    await this.reservaRepository.save(nuevaReserva);

    const ruta = await this.rutaRepository.findOne({
      where: { id: viaje.ruta_id }
    });

    return {
      mensaje: `Reserva confirmada para el asiento ${numeroAsiento}`,
      reserva: nuevaReserva,
      viaje: {
        ruta: ruta ? ruta.nombre : 'Ruta no disponible',
        fecha: viaje.fecha_hora_salida,
      }
    };
  }

  async obtenerReservasUsuario(usuarioId: string) {
    const reservas = await this.reservaRepository.find({
      where: { usuario_id: usuarioId },
      order: { creado_en: 'DESC' }
    });

    // Obtener información del viaje para cada reserva
    const reservasConInfo = await Promise.all(
      reservas.map(async (reserva) => {
        const viaje = await this.viajeRepository.findOne({
          where: { id: reserva.viaje_id }
        });
        const ruta = await this.rutaRepository.findOne({
          where: { id: viaje ? viaje.ruta_id : '' }
        });
        
        return {
          ...reserva,
          viaje: {
            fecha: viaje ? viaje.fecha_hora_salida : null,
            ruta: ruta ? ruta.nombre : 'Sin ruta'
          }
        };
      })
    );

    return reservasConInfo;
  }
}
