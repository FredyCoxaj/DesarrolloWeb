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
import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException, } from '@nestjs/common';
let BusesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BusesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BusesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(BusesService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(estado) {
            return this.prisma.bus.findMany({
                where: estado ? { estado: estado } : undefined,
                orderBy: { placa: 'asc' },
                include: {
                    _count: { select: { trips: true } },
                },
            });
        }
        async findOne(id) {
            const bus = await this.prisma.bus.findUnique({
                where: { id },
                include: {
                    _count: { select: { trips: true } },
                },
            });
            if (!bus) {
                throw new NotFoundException(`Bus con id ${id} no encontrado`);
            }
            return bus;
        }
        async create(dto) {
            const existente = await this.prisma.bus.findUnique({
                where: { placa: dto.placa },
            });
            if (existente) {
                throw new ConflictException('Ya existe un bus con esa placa');
            }
            // Calcular filas/columnas por defecto si no vienen
            const capacidad = dto.capacidad;
            const columnas = dto.columnas ?? 4;
            const filas = dto.filas ?? Math.ceil(capacidad / columnas);
            const bus = await this.prisma.bus.create({
                data: {
                    ...dto,
                    filas,
                    columnas,
                },
            });
            this.logger.log(` Bus creado: ${bus.placa}`);
            return bus;
        }
        async update(id, dto) {
            await this.findOne(id);
            if (dto.placa) {
                const existente = await this.prisma.bus.findUnique({
                    where: { placa: dto.placa },
                });
                if (existente && existente.id !== id) {
                    throw new ConflictException('Ya existe un bus con esa placa');
                }
            }
            return this.prisma.bus.update({
                where: { id },
                data: dto,
            });
        }
        async cambiarEstado(id, dto) {
            const bus = await this.findOne(id);
            if (bus.estado === dto.estado) {
                throw new BadRequestException(`El bus ya está en estado ${dto.estado}`);
            }
            const actualizado = await this.prisma.bus.update({
                where: { id },
                data: { estado: dto.estado },
            });
            this.logger.log(` Bus ${bus.placa}: ${bus.estado} → ${dto.estado}`);
            return actualizado;
        }
        async remove(id) {
            await this.findOne(id);
            const viajesActivos = await this.prisma.trip.count({
                where: {
                    busId: id,
                    estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
                },
            });
            if (viajesActivos > 0) {
                throw new BadRequestException(`No se puede eliminar: el bus tiene ${viajesActivos} viaje(s) activo(s)`);
            }
            await this.prisma.bus.delete({ where: { id } });
            this.logger.log(` Bus eliminado: ${id}`);
            return { message: 'Bus eliminado correctamente' };
        }
    };
    return BusesService = _classThis;
})();
export { BusesService };
