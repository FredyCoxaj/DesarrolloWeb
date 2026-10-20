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
import { Injectable, Logger } from '@nestjs/common';
let AdminService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        logger = new Logger(AdminService.name);
        constructor(prisma) {
            this.prisma = prisma;
        }
        // ============================================
        // DASHBOARD - KPIs generales
        // ============================================
        async dashboard(fechaInicio, fechaFin) {
            const { inicio, fin } = this.rangoFechas(fechaInicio, fechaFin);
            const [totalUsers, usuariosPorRol, totalBuses, busesPorEstado, totalRoutes, rutasActivas, totalTrips, viajesPorEstado, totalTickets, ticketsPorEstado,] = await Promise.all([
                this.prisma.user.count({ where: { activo: true } }),
                this.prisma.user.groupBy({
                    by: ['rol'],
                    _count: { _all: true },
                    where: { activo: true },
                }),
                this.prisma.bus.count(),
                this.prisma.bus.groupBy({ by: ['estado'], _count: { _all: true } }),
                this.prisma.route.count(),
                this.prisma.route.count({ where: { activa: true } }),
                this.prisma.trip.count({
                    where: { fechaSalida: { gte: inicio, lte: fin } },
                }),
                this.prisma.trip.groupBy({
                    by: ['estado'],
                    _count: { _all: true },
                    where: { fechaSalida: { gte: inicio, lte: fin } },
                }),
                this.prisma.ticket.count({
                    where: { createdAt: { gte: inicio, lte: fin } },
                }),
                this.prisma.ticket.groupBy({
                    by: ['estado'],
                    _count: { _all: true },
                    where: { createdAt: { gte: inicio, lte: fin } },
                }),
            ]);
            // Ingresos del rango
            const pagos = await this.prisma.pago.findMany({
                where: {
                    estado: 'COMPLETADO',
                    createdAt: { gte: inicio, lte: fin },
                },
                select: { monto: true, metodo: true },
            });
            const ingresos = pagos.reduce((acc, p) => {
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
            // Ocupación promedio
            const viajesConOcupacion = await this.prisma.trip.findMany({
                where: {
                    estado: { in: ['EN_CURSO', 'COMPLETADO'] },
                    fechaSalida: { gte: inicio, lte: fin },
                },
                include: { bus: { select: { capacidad: true } } },
            });
            const ocupacionPromedio = viajesConOcupacion.length > 0
                ? viajesConOcupacion.reduce((sum, t) => sum + t.asientosOcupados / t.bus.capacidad, 0) / viajesConOcupacion.length
                : 0;
            return {
                rango: { fechaInicio: inicio, fechaFin: fin },
                usuarios: {
                    total: totalUsers,
                    porRol: usuariosPorRol.map((r) => ({ rol: r.rol, cantidad: r._count._all })),
                },
                buses: {
                    total: totalBuses,
                    porEstado: busesPorEstado.map((b) => ({ estado: b.estado, cantidad: b._count._all })),
                },
                rutas: { total: totalRoutes, activas: rutasActivas },
                viajes: {
                    total: totalTrips,
                    porEstado: viajesPorEstado.map((v) => ({ estado: v.estado, cantidad: v._count._all })),
                },
                tickets: {
                    total: totalTickets,
                    porEstado: ticketsPorEstado.map((t) => ({ estado: t.estado, cantidad: t._count._all })),
                },
                ingresos: {
                    total: Math.round(ingresos.total * 100) / 100,
                    efectivo: Math.round(ingresos.efectivo * 100) / 100,
                    tarjeta: Math.round(ingresos.tarjeta * 100) / 100,
                    banco: Math.round(ingresos.banco * 100) / 100,
                },
                ocupacionPromedio: Math.round(ocupacionPromedio * 10000) / 100,
            };
        }
        // ============================================
        // INGRESOS POR BUS
        // ============================================
        async revenueByBus(fechaInicio, fechaFin) {
            const { inicio, fin } = this.rangoFechas(fechaInicio, fechaFin);
            const buses = await this.prisma.bus.findMany({
                include: {
                    trips: {
                        where: { fechaSalida: { gte: inicio, lte: fin } },
                        include: {
                            tickets: {
                                where: { pago: { estado: 'COMPLETADO' } },
                                include: { pago: true },
                            },
                        },
                    },
                },
            });
            const reporte = buses.map((bus) => {
                const pagos = bus.trips.flatMap((t) => t.tickets.map((tk) => tk.pago).filter((p) => p !== null));
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
                    busId: bus.id,
                    placa: bus.placa,
                    marca: bus.marca,
                    modelo: bus.modelo,
                    estado: bus.estado,
                    totalViajes: bus.trips.length,
                    totalPagos: pagos.length,
                    totales: {
                        total: Math.round(totales.total * 100) / 100,
                        efectivo: Math.round(totales.efectivo * 100) / 100,
                        tarjeta: Math.round(totales.tarjeta * 100) / 100,
                        banco: Math.round(totales.banco * 100) / 100,
                    },
                };
            });
            // Ordenar por total descendente
            reporte.sort((a, b) => b.totales.total - a.totales.total);
            return {
                rango: { fechaInicio: inicio, fechaFin: fin },
                buses: reporte,
            };
        }
        // ============================================
        // TOP RUTAS
        // ============================================
        async topRoutes(limite = 10, fechaInicio, fechaFin) {
            const { inicio, fin } = this.rangoFechas(fechaInicio, fechaFin);
            const rutas = await this.prisma.route.findMany({
                include: {
                    trips: {
                        where: { fechaSalida: { gte: inicio, lte: fin } },
                        include: {
                            tickets: true,
                            _count: { select: { tickets: true } },
                        },
                    },
                },
            });
            const reporte = rutas
                .map((ruta) => {
                const tickets = ruta.trips.flatMap((t) => t.tickets);
                const ingresos = tickets
                    .filter((t) => t.estado === 'PAGADO' || t.estado === 'ABORDADO')
                    .reduce((sum, t) => sum + Number(t.precio), 0);
                return {
                    routeId: ruta.id,
                    nombre: ruta.nombre,
                    origen: ruta.origen,
                    destino: ruta.destino,
                    color: ruta.color,
                    activa: ruta.activa,
                    totalViajes: ruta.trips.length,
                    totalTickets: tickets.length,
                    ingresos: Math.round(ingresos * 100) / 100,
                };
            })
                .sort((a, b) => b.totalTickets - a.totalTickets)
                .slice(0, limite);
            return {
                rango: { fechaInicio: inicio, fechaFin: fin },
                total: reporte.length,
                rutas: reporte,
            };
        }
        // ============================================
        // PASAJEROS RECURRENTES
        // ============================================
        async topPassengers(limite = 10, fechaInicio, fechaFin) {
            const { inicio, fin } = this.rangoFechas(fechaInicio, fechaFin);
            const pasajeros = await this.prisma.user.findMany({
                where: { rol: 'PASAJERO', activo: true },
                include: {
                    tickets: {
                        where: { createdAt: { gte: inicio, lte: fin } },
                        include: { trip: { include: { route: { select: { nombre: true } } } } },
                    },
                },
            });
            const reporte = pasajeros
                .map((p) => {
                const tickets = p.tickets;
                const totalGastado = tickets
                    .filter((t) => t.estado === 'PAGADO' || t.estado === 'ABORDADO')
                    .reduce((sum, t) => sum + Number(t.precio), 0);
                return {
                    userId: p.id,
                    nombre: p.nombre,
                    apellido: p.apellido,
                    dpi: p.dpi,
                    email: p.email,
                    totalTickets: tickets.length,
                    totalGastado: Math.round(totalGastado * 100) / 100,
                };
            })
                .filter((p) => p.totalTickets > 0)
                .sort((a, b) => b.totalTickets - a.totalTickets)
                .slice(0, limite);
            return {
                rango: { fechaInicio: inicio, fechaFin: fin },
                total: reporte.length,
                pasajeros: reporte,
            };
        }
        // ============================================
        // ALERTAS DEL SISTEMA
        // ============================================
        async alerts() {
            const ahora = new Date();
            const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
            const hace1Hora = new Date(ahora.getTime() - 60 * 60 * 1000);
            // 1. Buses en mantenimiento o fuera de servicio
            const busesNoDisponibles = await this.prisma.bus.findMany({
                where: { estado: { in: ['MANTENIMIENTO', 'FUERA_SERVICIO'] } },
                select: { id: true, placa: true, estado: true, marca: true, modelo: true },
            });
            // 2. Viajes EN_CURSO que no se han movido en la última hora (no GPS logs)
            const viajesSinMovimiento = await this.prisma.trip.findMany({
                where: {
                    estado: 'EN_CURSO',
                    gpsLogs: { none: { timestamp: { gte: hace1Hora } } },
                },
                include: {
                    bus: { select: { placa: true } },
                    chofer: { select: { nombre: true, apellido: true } },
                    route: { select: { nombre: true } },
                },
            });
            // 3. Viajes PROGRAMADOS que ya deberían haber comenzado
            const viajesAtrasados = await this.prisma.trip.findMany({
                where: {
                    estado: 'PROGRAMADO',
                    fechaSalida: { lt: ahora, gt: hace2Horas },
                },
                include: {
                    bus: { select: { placa: true } },
                    chofer: { select: { nombre: true, apellido: true } },
                    route: { select: { nombre: true } },
                },
            });
            // 4. Incidentes sin resolver
            const incidentesAbiertos = await this.prisma.incidente.findMany({
                where: { resuelto: false },
                include: {
                    trip: { select: { id: true } },
                    reportador: { select: { nombre: true, apellido: true, rol: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            // 5. Viajes con sobrecupo (más asientos ocupados que capacidad)
            const viajesConOcupacion = await this.prisma.trip.findMany({
                where: { estado: { in: ['PROGRAMADO', 'EN_CURSO'] } },
                include: { bus: { select: { placa: true, capacidad: true } } },
            });
            const sobrecupo = viajesConOcupacion.filter((v) => v.asientosOcupados > v.bus.capacidad);
            return {
                timestamp: ahora,
                totalAlertas: busesNoDisponibles.length +
                    viajesSinMovimiento.length +
                    viajesAtrasados.length +
                    incidentesAbiertos.length +
                    sobrecupo.length,
                busesNoDisponibles,
                viajesSinMovimiento: viajesSinMovimiento.map((v) => ({
                    tripId: v.id,
                    bus: v.bus.placa,
                    chofer: `${v.chofer.nombre} ${v.chofer.apellido}`,
                    ruta: v.route.nombre,
                    fechaSalida: v.fechaSalida,
                })),
                viajesAtrasados: viajesAtrasados.map((v) => ({
                    tripId: v.id,
                    bus: v.bus.placa,
                    chofer: `${v.chofer.nombre} ${v.chofer.apellido}`,
                    ruta: v.route.nombre,
                    fechaSalida: v.fechaSalida,
                    minutosAtraso: Math.round((ahora.getTime() - v.fechaSalida.getTime()) / 60000),
                })),
                incidentesAbiertos,
                sobrecupo: sobrecupo.map((v) => ({
                    tripId: v.id,
                    bus: v.bus.placa,
                    capacidad: v.bus.capacidad,
                    ocupados: v.asientosOcupados,
                })),
            };
        }
        // ============================================
        // HELPERS
        // ============================================
        rangoFechas(fechaInicio, fechaFin) {
            const hoy = new Date();
            const inicio = fechaInicio
                ? new Date(fechaInicio)
                : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const fin = fechaFin
                ? new Date(fechaFin)
                : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
            return { inicio, fin };
        }
    };
    return AdminService = _classThis;
})();
export { AdminService };
