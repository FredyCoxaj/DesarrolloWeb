import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PagoMetodo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CashPaymentDto } from './dto/cash-payment.dto';
import { CardPaymentDto } from './dto/card-payment.dto';
import { BankPaymentDto } from './dto/bank-payment.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // COBRO EN EFECTIVO (chofer registra)
  // ============================================
  async cash(dto: CashPaymentDto, choferId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: { trip: true, pago: true },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.trip.choferId !== choferId) {
      throw new ForbiddenException('Solo el chofer asignado al viaje puede registrar el cobro');
    }
    if (ticket.pago) {
      throw new BadRequestException('Este ticket ya tiene un pago registrado');
    }
    if (ticket.estado === 'CANCELADO') {
      throw new BadRequestException('El ticket está cancelado');
    }

    const pago = await this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          ticketId: ticket.id,
          monto: ticket.precio,
          metodo: PagoMetodo.EFECTIVO,
          estado: 'COMPLETADO',
          registradoPor: choferId,
          notas: dto.notas ?? 'Cobro en efectivo registrado por chofer',
        },
      });

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { estado: 'PAGADO' },
      });

      return nuevoPago;
    });

    this.logger.log(`💵 Cobro efectivo registrado: ${pago.id} (Q${pago.monto})`);
    return pago;
  }

  // ============================================
  // PAGO CON TARJETA (mock)
  // ============================================
  async card(dto: CardPaymentDto, pasajeroId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: { pago: true },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No puedes pagar un ticket que no es tuyo');
    }
    if (ticket.pago) {
      throw new BadRequestException('Este ticket ya tiene un pago registrado');
    }

    // MOCK: simulamos el procesamiento con la pasarela
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Regla mock: si el número termina en 0000 → rechaza
    if (dto.numeroTarjeta.endsWith('0000')) {
      throw new BadRequestException('Tarjeta rechazada por el banco (mock)');
    }

    const referencia = `CARD-${randomBytes(6).toString('hex').toUpperCase()}`;

    const pago = await this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          ticketId: ticket.id,
          monto: ticket.precio,
          metodo: PagoMetodo.TARJETA,
          estado: 'COMPLETADO',
          referencia,
          notas: `Pago con tarjeta ****${dto.numeroTarjeta.slice(-4)}`,
        },
      });

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { estado: 'PAGADO' },
      });

      return nuevoPago;
    });

    this.logger.log(`💳 Pago tarjeta: ${pago.id} - ref ${referencia}`);
    return pago;
  }

  // ============================================
  // PAGO CON CUENTA BANCARIA (mock)
  // ============================================
  async bank(dto: BankPaymentDto, pasajeroId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: { pago: true },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.pasajeroId !== pasajeroId) {
      throw new ForbiddenException('No puedes pagar un ticket que no es tuyo');
    }
    if (ticket.pago) {
      throw new BadRequestException('Este ticket ya tiene un pago registrado');
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    const referencia = `BANK-${randomBytes(6).toString('hex').toUpperCase()}`;

    const pago = await this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          ticketId: ticket.id,
          monto: ticket.precio,
          metodo: PagoMetodo.CUENTA_BANCARIA,
          estado: 'COMPLETADO',
          referencia,
          notas: `Transferencia desde ${dto.banco} - cuenta ****${dto.numeroCuenta.slice(-4)}`,
        },
      });

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { estado: 'PAGADO' },
      });

      return nuevoPago;
    });

    this.logger.log(`🏦 Pago banco: ${pago.id} - ref ${referencia}`);
    return pago;
  }

  // ============================================
  // MIS PAGOS (pasajero)
  // ============================================
  async myPayments(pasajeroId: string) {
    return this.prisma.pago.findMany({
      where: {
        ticket: { pasajeroId },
      },
      include: {
        ticket: {
          include: {
            trip: {
              include: {
                route: { select: { nombre: true, origen: true, destino: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // PAGOS DE UN VIAJE (chofer o admin)
  // ============================================
  async byTrip(tripId: string, userId: string, userRol: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: { select: { nombre: true } },
        bus: { select: { placa: true } },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');

    if (userRol !== 'ADMIN' && trip.choferId !== userId) {
      throw new ForbiddenException('Solo el chofer asignado o admin puede ver estos pagos');
    }

    const pagos = await this.prisma.pago.findMany({
      where: { ticket: { tripId } },
      include: {
        ticket: {
          include: {
            pasajero: { select: { nombre: true, apellido: true, dpi: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totales = pagos.reduce(
      (acc, p) => {
        const monto = Number(p.monto);
        acc.total += monto;
        if (p.metodo === 'EFECTIVO') acc.efectivo += monto;
        if (p.metodo === 'TARJETA') acc.tarjeta += monto;
        if (p.metodo === 'CUENTA_BANCARIA') acc.banco += monto;
        return acc;
      },
      { total: 0, efectivo: 0, tarjeta: 0, banco: 0 },
    );

    return {
      tripId,
      ruta: trip.route.nombre,
      bus: trip.bus.placa,
      totalPagos: pagos.length,
      totales: {
        total: Math.round(totales.total * 100) / 100,
        efectivo: Math.round(totales.efectivo * 100) / 100,
        tarjeta: Math.round(totales.tarjeta * 100) / 100,
        banco: Math.round(totales.banco * 100) / 100,
      },
      pagos,
    };
  }

  // ============================================
  // RESUMEN POR BUS Y FECHA (admin)
  // ============================================
  async summaryByBusAndDate(busId: string, fecha: string) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const bus = await this.prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new NotFoundException('Bus no encontrado');

    const pagos = await this.prisma.pago.findMany({
      where: {
        estado: 'COMPLETADO',
        createdAt: { gte: fechaInicio, lte: fechaFin },
        ticket: {
          trip: { busId },
        },
      },
      include: {
        ticket: {
          include: {
            trip: { include: { route: { select: { nombre: true } } } },
          },
        },
      },
    });

    const totales = pagos.reduce(
      (acc, p) => {
        const monto = Number(p.monto);
        acc.total += monto;
        if (p.metodo === 'EFECTIVO') acc.efectivo += monto;
        if (p.metodo === 'TARJETA') acc.tarjeta += monto;
        if (p.metodo === 'CUENTA_BANCARIA') acc.banco += monto;
        return acc;
      },
      { total: 0, efectivo: 0, tarjeta: 0, banco: 0 },
    );

    return {
      bus: { id: bus.id, placa: bus.placa },
      fecha,
      totalViajes: new Set(pagos.map((p) => p.ticket.tripId)).size,
      totalPagos: pagos.length,
      totales: {
        total: Math.round(totales.total * 100) / 100,
        efectivo: Math.round(totales.efectivo * 100) / 100,
        tarjeta: Math.round(totales.tarjeta * 100) / 100,
        banco: Math.round(totales.banco * 100) / 100,
      },
    };
  }
}