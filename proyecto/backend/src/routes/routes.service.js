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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
let RoutesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RoutesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RoutesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(RoutesService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ============================================
        // LISTAR TODAS LAS RUTAS (público)
        // ============================================
        async findAll(soloActivas = false) {
            return this.prisma.route.findMany({
                where: soloActivas ? { activa: true } : undefined,
                include: {
                    stops: { orderBy: { orden: 'asc' } },
                    _count: { select: { trips: true } },
                },
                orderBy: { nombre: 'asc' },
            });
        }
        // ============================================
        // OBTENER UNA RUTA (con paradas)
        // ============================================
        async findOne(id) {
            const route = await this.prisma.route.findUnique({
                where: { id },
                include: {
                    stops: { orderBy: { orden: 'asc' } },
                },
            });
            if (!route) {
                throw new NotFoundException(`Ruta con id ${id} no encontrada`);
            }
            return route;
        }
        // ============================================
        // CREAR RUTA (admin)
        // ============================================
        async create(dto) {
            const { stops, ...routeData } = dto;
            // Validar que no exista otra ruta con el mismo nombre
            const existente = await this.prisma.route.findFirst({
                where: { nombre: dto.nombre },
            });
            if (existente) {
                throw new BadRequestException('Ya existe una ruta con ese nombre');
            }
            // Validar orden de paradas
            if (stops && stops.length > 0) {
                const ordenes = stops.map((s) => s.orden);
                const ordenesUnicos = new Set(ordenes);
                if (ordenes.length !== ordenesUnicos.size) {
                    throw new BadRequestException('Los órdenes de paradas no pueden repetirse');
                }
            }
            const route = await this.prisma.route.create({
                data: {
                    ...routeData,
                    stops: stops
                        ? {
                            create: stops.map((s) => ({
                                nombre: s.nombre,
                                latitud: s.latitud,
                                longitud: s.longitud,
                                orden: s.orden,
                                esTerminal: s.esTerminal ?? false,
                            })),
                        }
                        : undefined,
                },
                include: { stops: { orderBy: { orden: 'asc' } } },
            });
            this.logger.log(` Ruta creada: ${route.nombre}`);
            return route;
        }
        // ============================================
        // ACTUALIZAR RUTA (admin)
        // ============================================
        async update(id, dto) {
            await this.findOne(id); // valida existencia
            const { stops, ...routeData } = dto;
            // Si vienen stops, borrar las anteriores y crear las nuevas (transaccional)
            if (stops) {
                return this.prisma.$transaction(async (tx) => {
                    await tx.routeStop.deleteMany({ where: { routeId: id } });
                    return tx.route.update({
                        where: { id },
                        data: {
                            ...routeData,
                            stops: {
                                create: stops.map((s) => ({
                                    nombre: s.nombre,
                                    latitud: s.latitud,
                                    longitud: s.longitud,
                                    orden: s.orden,
                                    esTerminal: s.esTerminal ?? false,
                                })),
                            },
                        },
                        include: { stops: { orderBy: { orden: 'asc' } } },
                    });
                });
            }
            return this.prisma.route.update({
                where: { id },
                data: routeData,
                include: { stops: { orderBy: { orden: 'asc' } } },
            });
        }
        // ============================================
        // ELIMINAR RUTA (admin)
        // ============================================
        async remove(id) {
            await this.findOne(id);
            // Verificar si hay viajes activos usando esta ruta
            const viajesActivos = await this.prisma.trip.count({
                where: {
                    routeId: id,
                    estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
                },
            });
            if (viajesActivos > 0) {
                throw new BadRequestException(`No se puede eliminar: hay ${viajesActivos} viaje(s) activo(s) usando esta ruta`);
            }
            await this.prisma.route.delete({ where: { id } });
            this.logger.log(`🗑️ Ruta eliminada: ${id}`);
            return { message: 'Ruta eliminada correctamente' };
        }
        // ============================================
        // CALCULAR PRECIO POR TRAMO
        // ============================================
        async calcularPrecio(routeId, paradaSubidaId, paradaBajadaId) {
            const route = await this.prisma.route.findUnique({
                where: { id: routeId },
                include: { stops: true },
            });
            if (!route) {
                throw new NotFoundException(`Ruta ${routeId} no encontrada`);
            }
            const subida = route.stops.find((s) => s.id === paradaSubidaId);
            const bajada = route.stops.find((s) => s.id === paradaBajadaId);
            if (!subida || !bajada) {
                throw new BadRequestException('Parada de subida o bajada no válida');
            }
            if (subida.orden >= bajada.orden) {
                throw new BadRequestException('La parada de bajada debe estar después de la de subida');
            }
            // Precio proporcional a la distancia en paradas
            const totalParadas = route.stops.length - 1;
            const tramoRecorrido = bajada.orden - subida.orden;
            const proporcion = tramoRecorrido / totalParadas;
            const precio = Math.round(Number(route.precioBase) * proporcion * 100) / 100;
            return {
                routeId,
                paradaSubida: { id: subida.id, nombre: subida.nombre, orden: subida.orden },
                paradaBajada: { id: bajada.id, nombre: bajada.nombre, orden: bajada.orden },
                precioTotal: Number(route.precioBase),
                tramoRecorrido,
                totalParadas,
                precioCalculado: precio,
            };
        }
    };
    return RoutesService = _classThis;
})();
export { RoutesService };
