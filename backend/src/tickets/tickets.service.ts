import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoutesService } from '../routes/routes.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routesService: RoutesService,
  ) {}

  // ============================================
  // CREAR TICKET (reservar asiento)
  // ============================================
  async create(dto: CreateTicketDto, pasajeroId: string) {
    // 1. Validar que el viaje existe y está disponible
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
      include: { route: { include: { stops: true } }, bus: true },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');
    if (trip.estado !== 'PROGRAMADO') {
      throw new BadRequestException(`No se puede reservar en un viaje ${trip.estado}`);
    }

    // 2. Validar asiento dentro del rango
    if (dto.asiento > trip.bus.capacidad) {
      throw new BadRequestException(
        `El asiento ${dto.asiento} está fuera del rango (1-${trip.bus.capacidad})`,
      );
    }

    // 3. Validar que las paradas pertenezcan a la ruta del viaje
    const subida = trip.route.stops.find((s) => s.id === dto.paradaSubidaId);
    const bajada = trip.route.stops.find((s) => s.id === dto.paradaBajadaId);
    if (!subida || !bajada) {
      throw new BadRequestException('Las paradas no pertenecen a la ruta del viaje');
    }

    // 4. Calcular precio con la lógica de Routes
    const calculo = await this.routesService.calcularPrecio(
      trip.routeId,
      dto.paradaSubidaId,
      dto.paradaBajadaId,
    );

    // 5. Generar código QR único
    const qrCode = randomBytes(16).toString('hex');

    // 6. Crear ticket en transacción (con validación de asiento libre)
    try {
      const ticket = await this.prisma.$transaction(async (tx) => {
        // Verificar asiento disponible dentro de la transacción
        const asientoOcupado = await tx.ticket.findUnique({
          where: {
            tripId_asiento: { tripId: dto.tripId, asiento: dto.asiento },
          },
        });
        if (asientoOcupado && asientoOcupado.estado !== 'CANCELADO') {
          throw new ConflictException(`El asiento ${dto.asiento} ya está ocupado`);
        }

        // Crear ticket
        const nuevoTicket = await tx.ticket.create({
          data: {
            tripId: dto.tripId,
            pasajeroId,
            asiento: dto.asiento,
            paradaSubidaId: dto.paradaSubidaId,
            paradaBajadaId: dto.paradaBajadaId,
            precio: calculo.precioCalculado,
            qrCode,
            estado: 'RESERVADO',
          },
        });

        // Actualizar asientosOcupados en el trip
        await tx.trip.update({
          where: { id: dto.tripId },
          data: { asientosOcupados: { increment: 1 } },
        });

        return nuevoTicket;
      });

      this.logger.log(` Ticket creado: asiento ${dto.asiento} viaje ${dto.tripId}`);

      // Generar QR como Data URL
      const qrDataUrl = await QRCode.toDataURL(qrCode);

      return {
        ...ticket,
        qrDataUrl,
        detalles: {
          ruta: trip.route.nombre,
          origen: trip.route.origen,
          destino: trip.route.destino,
          paradaSubida: subida.nombre,
          paradaBajada: bajada.nombre,
          fechaSalida: trip.fechaSalida,
          bus: trip.bus.placa,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Error al crear ticket', error);
      throw new BadRequestException('No se pudo crear el ticket');
    }
  }

  // ============================================
  // MIS TICKETS (historial del pasajero)
  // ============================================
  async myTickets(pasajeroId: string) {
    return this.prisma.ticket.findMany({
      where: { pasajeroId },
      include: {
        trip: {
          include: {
            route: { select: { nombre: true, origen: true, destino: true, color: true } },
            bus: { select: { placa: true } },
            chofer: { select: { nombre: true, apellido: true } },
          },
        },
        pago: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // DETALLE DE TICKET
  // ============================================
  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            route: { include: { stops: { orderBy: { orden: 'asc' } } } },
            bus: { select: { placa: true, capacidad: true } },
            chofer: { select: { nombre: true, apellido: true, telefono: true } },
          },
        },
        pasajero: {
          select: { id: true, nombre: true, apellido: true, dpi: true, telefono: true },
        },
        pago: true,
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    const qrDataUrl = await QRCode.toDataURL(ticket.qrCode);

    return { ...ticket, qrDataUrl };
  }

  // ============================================
  // MAPA DE ASIENTOS (para selección)
  // ============================================
  async asientosDeViaje(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bus: true,
        tickets: {
          where: { estado: { in: ['RESERVADO', 'PAGADO', 'ABORDADO'] } },
          select: { asiento: true, estado: true },
        },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');

    const ocupados = trip.tickets.map((t) => t.asiento);
    const total = trip.bus.capacidad;
    const disponibles: number[] = [];

    for (let i = 1; i <= total; i++) {
      if (!ocupados.includes(i)) disponibles.push(i);
    }

    return {
      tripId,
      bus: { placa: trip.bus.placa, capacidad: total, filas: trip.bus.filas, columnas: trip.bus.columnas },
      total,
      ocupados,
      disponibles,
      porcentajeOcupacion: Math.round((ocupados.length / total) * 100),
    };
  }

  // ============================================
  // PAGAR TICKET (mock)
  // ============================================
  async pagar(id: string, pasajeroId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No puedes pagar un ticket que no es tuyo');
    }
    if (ticket.estado === 'PAGADO' || ticket.estado === 'ABORDADO') {
      throw new BadRequestException('El ticket ya está pagado');
    }
    if (ticket.estado === 'CANCELADO') {
      throw new BadRequestException('El ticket está cancelado');
    }

    // Mock: creamos un pago "COMPLETADO" con método EFECTIVO por defecto
    // (En producción, aquí se integraría la pasarela de pago)
    const actualizado = await this.prisma.$transaction(async (tx) => {
      await tx.pago.create({
        data: {
          ticketId: id,
          monto: ticket.precio,
          metodo: 'EFECTIVO',
          estado: 'COMPLETADO',
          notas: 'Pago mock para pruebas',
        },
      });

      return tx.ticket.update({
        where: { id },
        data: { estado: 'PAGADO' },
        include: { pago: true },
      });
    });

    this.logger.log(` Ticket pagado: ${id}`);
    return actualizado;
  }

  // ============================================
  // VALIDAR ABORDAJE (chofer escanea QR)
  // ============================================
  async validarAbordaje(dto: ValidateTicketDto, userId: string, userRol: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode: dto.qrCode },
      include: {
        trip: { select: { id: true, choferId: true, estado: true } },
        pasajero: { select: { nombre: true, apellido: true, dpi: true } },
      },
    });

    if (!ticket) throw new NotFoundException('QR no válido o ticket no existe');

    // Solo el chofer del viaje o un admin puede validar
    if (userRol !== 'ADMIN' && ticket.trip.choferId !== userId) {
      throw new ForbiddenException('Solo el chofer asignado puede validar este ticket');
    }

    if (ticket.estado === 'ABORDADO') {
      throw new BadRequestException('Este ticket ya fue abordado');
    }
    if (ticket.estado === 'CANCELADO') {
      throw new BadRequestException('Este ticket está cancelado');
    }
    if (ticket.estado === 'RESERVADO') {
      throw new BadRequestException('El ticket no ha sido pagado todavía');
    }
    if (ticket.trip.estado !== 'EN_CURSO') {
      throw new BadRequestException('El viaje no está en curso');
    }

    const actualizado = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        estado: 'ABORDADO',
        abordadoEn: new Date(),
      },
      include: {
        pasajero: { select: { nombre: true, apellido: true, dpi: true } },
      },
    });

    this.logger.log(`✅ Abordaje validado: ${ticket.pasajero.nombre} - asiento ${ticket.asiento}`);
    return {
      ok: true,
      mensaje: `Bienvenido ${ticket.pasajero.nombre} ${ticket.pasajero.apellido}`,
      ticket: actualizado,
    };
  }

  // ============================================
  // CANCELAR TICKET
  // ============================================
  async cancelar(id: string, userId: string, userRol: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (userRol !== 'ADMIN' && ticket.pasajeroId !== userId) {
      throw new ForbiddenException('No puedes cancelar un ticket que no es tuyo');
    }

    if (ticket.estado === 'ABORDADO') {
      throw new BadRequestException('No se puede cancelar un ticket ya abordado');
    }
    if (ticket.estado === 'CANCELADO') {
      throw new BadRequestException('El ticket ya está cancelado');
    }

    const actualizado = await this.prisma.$transaction(async (tx) => {
      const cancelado = await tx.ticket.update({
        where: { id },
        data: { estado: 'CANCELADO' },
      });

      // Decrementar asientosOcupados
      await tx.trip.update({
        where: { id: ticket.tripId },
        data: { asientosOcupados: { decrement: 1 } },
      });

      return cancelado;
    });

    this.logger.log(` Ticket cancelado: ${id}`);
    return actualizado;
  }
}