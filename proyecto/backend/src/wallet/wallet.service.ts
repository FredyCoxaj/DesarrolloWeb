import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Ver el saldo actual
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { saldo: Number(user.saldo) };
  }

  // 2. Recargar saldo (Simula una pasarela de pago o cobro en taquilla)
  async recargar(userId: string, monto: number) {
    if (monto <= 0) throw new BadRequestException('El monto a recargar debe ser mayor a 0');
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { saldo: { increment: monto } },
    });
    
    return { mensaje: 'Recarga exitosa', nuevoSaldo: Number(user.saldo) };
  }

  // 3. Pagar ticket con el saldo de la billetera
  async pagarTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!ticket || !user) throw new BadRequestException('Ticket o usuario no encontrado');
    if (ticket.pasajeroId !== userId) throw new BadRequestException('Este ticket no te pertenece');
    if (ticket.estado !== 'RESERVADO') throw new BadRequestException('El ticket no está en estado RESERVADO');
    
    const saldoActual = Number(user.saldo);
    const precioTicket = Number(ticket.precio);

    if (saldoActual < precioTicket) {
      throw new BadRequestException(`Saldo insuficiente. Tienes Q${saldoActual} y necesitas Q${precioTicket}`);
    }

    // Transacción: Descontar saldo de la billetera, crear el pago y marcar ticket como PAGADO
    return this.prisma.$transaction(async (tx) => {
      // Descontar saldo
      await tx.user.update({
        where: { id: userId },
        data: { saldo: { decrement: precioTicket } },
      });

      // Registrar el pago
      await tx.pago.create({
        data: {
          ticketId: ticket.id,
          monto: ticket.precio,
          metodo: 'TARJETA', // Usamos el enum TARJETA pero lo identificamos en notas
          estado: 'COMPLETADO',
          notas: 'Pago con Billetera Digital (Saldo)',
        },
      });

      // Cambiar estado del ticket
      return tx.ticket.update({
        where: { id: ticket.id },
        data: { estado: 'PAGADO' },
      });
    });
  }
}