import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // LISTAR VIAJES CON FILTROS
  // ============================================
  async findAll(filtros: {
    estado?: string;
    routeId?: string;
    busId?: string;
    choferId?: string;
    fecha?: string;
  }) {
    const where: any = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.routeId) where.routeId = filtros.routeId;
    if (filtros.busId) where.busId = filtros.busId;
    if (filtros.choferId) where.choferId = filtros.choferId;

    if (filtros.fecha) {
      const fecha = new Date(filtros.fecha);
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      where.fechaSalida = {
        gte: inicioDia,
        lte: finDia,
      };
    }

    return this.prisma.trip.findMany({
      where,
      include: {
        route: { select: { id: true, nombre: true, origen: true, destino: true, color: true } },
        bus: { select: { id: true, placa: true, capacidad: true, filas: true, columnas: true } },
        chofer: { select: { id: true, nombre: true, apellido: true, telefono: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { fechaSalida: 'asc' },
    });
  }

  // ============================================
  // DETALLE DE UN VIAJE
  // ============================================
  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        route: { include: { stops: { orderBy: { orden: 'asc' } } } },
        bus: true,
        chofer: {
          select: { id: true, nombre: true, apellido: true, telefono: true, email: true },
        },
        tickets: {
          include: {
            pasajero: { select: { id: true, nombre: true, apellido: true, dpi: true } },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Viaje con id ${id} no encontrado`);
    }

    return trip;
  }

  // ============================================
  // CREAR VIAJE (admin)
  // ============================================
  async create(dto: CreateTripDto) {
    // Validar que la ruta existe y está activa
    const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new BadRequestException('Ruta no encontrada');
    if (!route.activa) throw new BadRequestException('La ruta está inactiva');

    // Validar bus
    const bus = await this.prisma.bus.findUnique({ where: { id: dto.busId } });
    if (!bus) throw new BadRequestException('Bus no encontrado');
    if (bus.estado !== 'ACTIVO') {
      throw new BadRequestException(`El bus no está disponible (estado: ${bus.estado})`);
    }

    // Validar chofer
    const chofer = await this.prisma.user.findUnique({ where: { id: dto.choferId } });
    if (!chofer) throw new BadRequestException('Chofer no encontrado');
    if (chofer.rol !== 'CHOFER') {
      throw new BadRequestException('El usuario no tiene rol CHOFER');
    }
    if (!chofer.activo) throw new BadRequestException('El chofer está inactivo');

    // Validar que no haya conflicto de horario con el bus (mismo bus, misma hora ±2h)
    const fechaSalida = new Date(dto.fechaSalida);
    const margen = 2 * 60 * 60 * 1000;
    const conflictoBus = await this.prisma.trip.findFirst({
      where: {
        busId: dto.busId,
        estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
        fechaSalida: {
          gte: new Date(fechaSalida.getTime() - margen),
          lte: new Date(fechaSalida.getTime() + margen),
        },
      },
    });
    if (conflictoBus) {
      throw new BadRequestException('El bus ya tiene un viaje programado en ese horario');
    }

    // Validar conflicto con el chofer
    const conflictoChofer = await this.prisma.trip.findFirst({
      where: {
        choferId: dto.choferId,
        estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
        fechaSalida: {
          gte: new Date(fechaSalida.getTime() - margen),
          lte: new Date(fechaSalida.getTime() + margen),
        },
      },
    });
    if (conflictoChofer) {
      throw new BadRequestException('El chofer ya tiene un viaje en ese horario');
    }

    const trip = await this.prisma.trip.create({
      data: {
        routeId: dto.routeId,
        busId: dto.busId,
        choferId: dto.choferId,
        fechaSalida,
      },
      include: {
        route: { select: { id: true, nombre: true } },
        bus: { select: { id: true, placa: true } },
        chofer: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    this.logger.log(` Viaje creado: ${trip.id} (${route.nombre})`);
    return trip;
  }

  // ============================================
  // ACTUALIZAR VIAJE (admin)
  // ============================================
  async update(id: string, dto: UpdateTripDto) {
    const trip = await this.findOne(id);
    if (trip.estado === 'EN_CURSO' || trip.estado === 'COMPLETADO') {
      throw new BadRequestException('No se puede editar un viaje en curso o completado');
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        ...dto,
        fechaSalida: dto.fechaSalida ? new Date(dto.fechaSalida) : undefined,
      },
    });
  }

  // ============================================
  // INICIAR VIAJE (chofer asignado o admin)
  // ============================================
  async iniciar(id: string, userId: string, userRol: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    if (trip.estado !== 'PROGRAMADO') {
      throw new BadRequestException(`No se puede iniciar un viaje en estado ${trip.estado}`);
    }

    // Verificar permisos: solo el chofer asignado o un admin
    if (userRol !== 'ADMIN' && trip.choferId !== userId) {
      throw new ForbiddenException('Solo el chofer asignado o un admin puede iniciar este viaje');
    }

    const actualizado = await this.prisma.trip.update({
      where: { id },
      data: { estado: 'EN_CURSO' },
    });

    this.logger.log(` Viaje iniciado: ${id}`);
    return actualizado;
  }

  // ============================================
  // FINALIZAR VIAJE (chofer asignado o admin)
  // ============================================
  async finalizar(id: string, userId: string, userRol: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    if (trip.estado !== 'EN_CURSO') {
      throw new BadRequestException(`No se puede finalizar un viaje en estado ${trip.estado}`);
    }

    if (userRol !== 'ADMIN' && trip.choferId !== userId) {
      throw new ForbiddenException('Solo el chofer asignado o un admin puede finalizar este viaje');
    }

    const actualizado = await this.prisma.trip.update({
      where: { id },
      data: {
        estado: 'COMPLETADO',
        fechaLlegada: new Date(),
      },
    });

    this.logger.log(`🏁 Viaje finalizado: ${id}`);
    return actualizado;
  }

  // ============================================
  // CANCELAR VIAJE (admin)
  // ============================================
  async cancelar(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    if (trip.estado === 'COMPLETADO' || trip.estado === 'CANCELADO') {
      throw new BadRequestException(`El viaje ya está ${trip.estado}`);
    }

    const actualizado = await this.prisma.trip.update({
      where: { id },
      data: { estado: 'CANCELADO' },
    });

    this.logger.log(` Viaje cancelado: ${id}`);
    return actualizado;
  }

  // ============================================
  // LISTA DE PASAJEROS DEL VIAJE (chofer)
  // ============================================
  async pasajeros(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        route: { select: { nombre: true, origen: true, destino: true } },
        tickets: {
          include: {
            pasajero: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dpi: true,
                telefono: true,
                esMenor: true,
              },
            },
          },
          orderBy: { asiento: 'asc' },
        },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');

    return {
      tripId: trip.id,
      ruta: trip.route.nombre,
      estado: trip.estado,
      totalPasajeros: trip.tickets.length,
      asientosOcupados: trip.asientosOcupados,
      pasajeros: trip.tickets.map((t) => ({
        ticketId: t.id,
        asiento: t.asiento,
        estado: t.estado,
        precio: t.precio,
        pasajero: t.pasajero,
      })),
    };
  }
}