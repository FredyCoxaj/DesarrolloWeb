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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
let TripsController = (() => {
    let _classDecorators = [Controller('trips')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findOne_decorators;
    let _pasajeros_decorators;
    let _create_decorators;
    let _update_decorators;
    let _iniciar_decorators;
    let _finalizar_decorators;
    let _cancelar_decorators;
    var TripsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [Public(), Get()];
            _findOne_decorators = [Get(':id')];
            _pasajeros_decorators = [Roles(Role.CHOFER, Role.ADMIN), Get(':id/passengers')];
            _create_decorators = [Roles(Role.ADMIN), Post(), HttpCode(HttpStatus.CREATED)];
            _update_decorators = [Roles(Role.ADMIN), Patch(':id')];
            _iniciar_decorators = [Roles(Role.CHOFER, Role.ADMIN), Patch(':id/start')];
            _finalizar_decorators = [Roles(Role.CHOFER, Role.ADMIN), Patch(':id/finish')];
            _cancelar_decorators = [Roles(Role.ADMIN), Patch(':id/cancel')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pasajeros_decorators, { kind: "method", name: "pasajeros", static: false, private: false, access: { has: obj => "pasajeros" in obj, get: obj => obj.pasajeros }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _iniciar_decorators, { kind: "method", name: "iniciar", static: false, private: false, access: { has: obj => "iniciar" in obj, get: obj => obj.iniciar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _finalizar_decorators, { kind: "method", name: "finalizar", static: false, private: false, access: { has: obj => "finalizar" in obj, get: obj => obj.finalizar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelar_decorators, { kind: "method", name: "cancelar", static: false, private: false, access: { has: obj => "cancelar" in obj, get: obj => obj.cancelar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TripsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        tripsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(tripsService) {
            this.tripsService = tripsService;
        }
        // PÚBLICO: listar viajes (con filtros)
        findAll(estado, routeId, busId, choferId, fecha) {
            return this.tripsService.findAll({ estado, routeId, busId, choferId, fecha });
        }
        // PROTEGIDO: solo el chofer asignado, admin o pasajeros con ticket deberían ver detalle
        // Por simplicidad, cualquier usuario autenticado puede ver
        findOne(id) {
            return this.tripsService.findOne(id);
        }
        // PROTEGIDO: lista de pasajeros (chofer asignado o admin)
        pasajeros(id) {
            return this.tripsService.pasajeros(id);
        }
        // ADMIN: crear viaje
        create(dto) {
            return this.tripsService.create(dto);
        }
        // ADMIN: actualizar
        update(id, dto) {
            return this.tripsService.update(id, dto);
        }
        // CHOFER asignado o ADMIN: iniciar
        iniciar(id, user) {
            return this.tripsService.iniciar(id, user.id, user.rol);
        }
        // CHOFER asignado o ADMIN: finalizar
        finalizar(id, user) {
            return this.tripsService.finalizar(id, user.id, user.rol);
        }
        // ADMIN: cancelar
        cancelar(id) {
            return this.tripsService.cancelar(id);
        }
    };
    return TripsController = _classThis;
})();
export { TripsController };
