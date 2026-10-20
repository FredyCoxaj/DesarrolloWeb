var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, } from '@nestjs/common';
import { PagoMetodo } from '@prisma/client';
import { randomBytes } from 'crypto';
let PaymentsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(PaymentsService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ============================================
        // COBRO EN EFECTIVO (chofer registra)
        // ============================================
        async cash(dto, choferId) {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: dto.ticketId },
                include: { trip: true, pago: true },
            });
            if (!ticket)
                throw new NotFoundException('Ticket no encontrado');
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
        async card(dto, pasajeroId) {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: dto.ticketId },
                include: { pago: true },
            });
            if (!ticket)
                throw new NotFoundException('Ticket no encontrado');
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
        async bank(dto, pasajeroId) {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: dto.ticketId },
                include: { pago: true },
            });
            if (!ticket)
                throw new NotFoundException('Ticket no encontrado');
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
        async myPayments(pasajeroId) {
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
        async byTrip(tripId, userId, userRol) {
            const trip = await this.prisma.trip.findUnique({
                where: { id: tripId },
                include: {
                    route: { select: { nombre: true } },
                    bus: { select: { placa: true } },
                },
            });
            if (!trip)
                throw new NotFoundException('Viaje no encontrado');
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
            const totales = pagos.reduce((acc, p) => {
                const monto = Number(p.monto);
                acc.total += monto;
                if (p.metodo === 'EFECTIVO')
                    acc.efectivo += monto;
                if (p.metodo === 'TARJETA')
                    acc.tarjeta += monto;
                if (p.metodo === 'CUENTA_BANCARIA')
                    acc.banco += monto;
                return acc;
            }, { total: 0, efectivo: 0, tarjeta: 0, banco: 0 });
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
        async summaryByBusAndDate(busId, fecha) {
            const fechaInicio = new Date(fecha);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);
            const bus = await this.prisma.bus.findUnique({ where: { id: busId } });
            if (!bus)
                throw new NotFoundException('Bus no encontrado');
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
            const totales = pagos.reduce((acc, p) => {
                const monto = Number(p.monto);
                acc.total += monto;
                if (p.metodo === 'EFECTIVO')
                    acc.efectivo += monto;
                if (p.metodo === 'TARJETA')
                    acc.tarjeta += monto;
                if (p.metodo === 'CUENTA_BANCARIA')
                    acc.banco += monto;
                return acc;
            }, { total: 0, efectivo: 0, tarjeta: 0, banco: 0 });
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
    };
    return PaymentsService = _classThis;
})();
export { PaymentsService };
