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
let TripsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TripsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TripsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(TripsService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ============================================
        // LISTAR VIAJES CON FILTROS
        // ============================================
        async findAll(filtros) {
            const where = {};
            if (filtros.estado)
                where.estado = filtros.estado;
            if (filtros.routeId)
                where.routeId = filtros.routeId;
            if (filtros.busId)
                where.busId = filtros.busId;
            if (filtros.choferId)
                where.choferId = filtros.choferId;
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
        async findOne(id) {
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
        async create(dto) {
            // Validar que la ruta existe y está activa
            const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
            if (!route)
                throw new BadRequestException('Ruta no encontrada');
            if (!route.activa)
                throw new BadRequestException('La ruta está inactiva');
            // Validar bus
            const bus = await this.prisma.bus.findUnique({ where: { id: dto.busId } });
            if (!bus)
                throw new BadRequestException('Bus no encontrado');
            if (bus.estado !== 'ACTIVO') {
                throw new BadRequestException(`El bus no está disponible (estado: ${bus.estado})`);
            }
            // Validar chofer
            const chofer = await this.prisma.user.findUnique({ where: { id: dto.choferId } });
            if (!chofer)
                throw new BadRequestException('Chofer no encontrado');
            if (chofer.rol !== 'CHOFER') {
                throw new BadRequestException('El usuario no tiene rol CHOFER');
            }
            if (!chofer.activo)
                throw new BadRequestException('El chofer está inactivo');
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
        async update(id, dto) {
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
        async iniciar(id, userId, userRol) {
            const trip = await this.prisma.trip.findUnique({ where: { id } });
            if (!trip)
                throw new NotFoundException('Viaje no encontrado');
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
        async finalizar(id, userId, userRol) {
            const trip = await this.prisma.trip.findUnique({ where: { id } });
            if (!trip)
                throw new NotFoundException('Viaje no encontrado');
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
        async cancelar(id) {
            const trip = await this.prisma.trip.findUnique({ where: { id } });
            if (!trip)
                throw new NotFoundException('Viaje no encontrado');
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
        async pasajeros(id) {
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
            if (!trip)
                throw new NotFoundException('Viaje no encontrado');
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
    };
    return TripsService = _classThis;
})();
export { TripsService };
