var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Get, Post, Patch, HttpCode, HttpStatus, } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
let TicketsController = (() => {
    let _classDecorators = [Controller('tickets')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _asientos_decorators;
    let _create_decorators;
    let _myTickets_decorators;
    let _findOne_decorators;
    let _pagar_decorators;
    let _validar_decorators;
    let _cancelar_decorators;
    var TicketsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _asientos_decorators = [Public(), Get('trip/:tripId/seats')];
            _create_decorators = [Post(), HttpCode(HttpStatus.CREATED)];
            _myTickets_decorators = [Get('my-tickets')];
            _findOne_decorators = [Get(':id')];
            _pagar_decorators = [Post(':id/pay')];
            _validar_decorators = [Roles(Role.CHOFER, Role.ADMIN), Post('validate'), HttpCode(HttpStatus.OK)];
            _cancelar_decorators = [Patch(':id/cancel')];
            __esDecorate(this, null, _asientos_decorators, { kind: "method", name: "asientos", static: false, private: false, access: { has: obj => "asientos" in obj, get: obj => obj.asientos }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _myTickets_decorators, { kind: "method", name: "myTickets", static: false, private: false, access: { has: obj => "myTickets" in obj, get: obj => obj.myTickets }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pagar_decorators, { kind: "method", name: "pagar", static: false, private: false, access: { has: obj => "pagar" in obj, get: obj => obj.pagar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _validar_decorators, { kind: "method", name: "validar", static: false, private: false, access: { has: obj => "validar" in obj, get: obj => obj.validar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelar_decorators, { kind: "method", name: "cancelar", static: false, private: false, access: { has: obj => "cancelar" in obj, get: obj => obj.cancelar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TicketsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        ticketsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(ticketsService) {
            this.ticketsService = ticketsService;
        }
        // PÚBLICO: ver asientos ocupados/libres de un viaje
        asientos(tripId) {
            return this.ticketsService.asientosDeViaje(tripId);
        }
        // PASAJERO: reservar
        create(dto, user) {
            return this.ticketsService.create(dto, user.id);
        }
        // PASAJERO: mis tickets
        myTickets(user) {
            return this.ticketsService.myTickets(user.id);
        }
        // PASAJERO: detalle de un ticket
        findOne(id) {
            return this.ticketsService.findOne(id);
        }
        // PASAJERO: pagar
        pagar(id, user) {
            return this.ticketsService.pagar(id, user.id);
        }
        // CHOFER o ADMIN: validar abordaje (escaneo de QR)
        validar(dto, user) {
            return this.ticketsService.validarAbordaje(dto, user.id, user.rol);
        }
        // PASAJERO o ADMIN: cancelar
        cancelar(id, user) {
            return this.ticketsService.cancelar(id, user.id, user.rol);
        }
    };
    return TicketsController = _classThis;
})();
export { TicketsController };
