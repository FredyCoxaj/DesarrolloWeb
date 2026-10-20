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
import { IsUUID, IsInt, Min } from 'class-validator';
let CreateTicketDto = (() => {
    let _tripId_decorators;
    let _tripId_initializers = [];
    let _tripId_extraInitializers = [];
    let _asiento_decorators;
    let _asiento_initializers = [];
    let _asiento_extraInitializers = [];
    let _paradaSubidaId_decorators;
    let _paradaSubidaId_initializers = [];
    let _paradaSubidaId_extraInitializers = [];
    let _paradaBajadaId_decorators;
    let _paradaBajadaId_initializers = [];
    let _paradaBajadaId_extraInitializers = [];
    return class CreateTicketDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _tripId_decorators = [IsUUID('4', { message: 'tripId debe ser un UUID válido' })];
            _asiento_decorators = [IsInt(), Min(1, { message: 'El asiento debe ser mayor a 0' })];
            _paradaSubidaId_decorators = [IsUUID('4', { message: 'paradaSubidaId debe ser un UUID válido' })];
            _paradaBajadaId_decorators = [IsUUID('4', { message: 'paradaBajadaId debe ser un UUID válido' })];
            __esDecorate(null, null, _tripId_decorators, { kind: "field", name: "tripId", static: false, private: false, access: { has: obj => "tripId" in obj, get: obj => obj.tripId, set: (obj, value) => { obj.tripId = value; } }, metadata: _metadata }, _tripId_initializers, _tripId_extraInitializers);
            __esDecorate(null, null, _asiento_decorators, { kind: "field", name: "asiento", static: false, private: false, access: { has: obj => "asiento" in obj, get: obj => obj.asiento, set: (obj, value) => { obj.asiento = value; } }, metadata: _metadata }, _asiento_initializers, _asiento_extraInitializers);
            __esDecorate(null, null, _paradaSubidaId_decorators, { kind: "field", name: "paradaSubidaId", static: false, private: false, access: { has: obj => "paradaSubidaId" in obj, get: obj => obj.paradaSubidaId, set: (obj, value) => { obj.paradaSubidaId = value; } }, metadata: _metadata }, _paradaSubidaId_initializers, _paradaSubidaId_extraInitializers);
            __esDecorate(null, null, _paradaBajadaId_decorators, { kind: "field", name: "paradaBajadaId", static: false, private: false, access: { has: obj => "paradaBajadaId" in obj, get: obj => obj.paradaBajadaId, set: (obj, value) => { obj.paradaBajadaId = value; } }, metadata: _metadata }, _paradaBajadaId_initializers, _paradaBajadaId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        tripId = __runInitializers(this, _tripId_initializers, void 0);
        asiento = (__runInitializers(this, _tripId_extraInitializers), __runInitializers(this, _asiento_initializers, void 0));
        paradaSubidaId = (__runInitializers(this, _asiento_extraInitializers), __runInitializers(this, _paradaSubidaId_initializers, void 0));
        paradaBajadaId = (__runInitializers(this, _paradaSubidaId_extraInitializers), __runInitializers(this, _paradaBajadaId_initializers, void 0));
        constructor() {
            __runInitializers(this, _paradaBajadaId_extraInitializers);
        }
    };
})();
export { CreateTicketDto };
