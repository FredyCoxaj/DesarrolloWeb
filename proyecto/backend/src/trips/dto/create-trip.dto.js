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
import { IsUUID, IsDateString } from 'class-validator';
let CreateTripDto = (() => {
    let _routeId_decorators;
    let _routeId_initializers = [];
    let _routeId_extraInitializers = [];
    let _busId_decorators;
    let _busId_initializers = [];
    let _busId_extraInitializers = [];
    let _choferId_decorators;
    let _choferId_initializers = [];
    let _choferId_extraInitializers = [];
    let _fechaSalida_decorators;
    let _fechaSalida_initializers = [];
    let _fechaSalida_extraInitializers = [];
    return class CreateTripDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _routeId_decorators = [IsUUID('4', { message: 'routeId debe ser un UUID válido' })];
            _busId_decorators = [IsUUID('4', { message: 'busId debe ser un UUID válido' })];
            _choferId_decorators = [IsUUID('4', { message: 'choferId debe ser un UUID válido' })];
            _fechaSalida_decorators = [IsDateString({}, { message: 'La fecha debe estar en formato ISO' })];
            __esDecorate(null, null, _routeId_decorators, { kind: "field", name: "routeId", static: false, private: false, access: { has: obj => "routeId" in obj, get: obj => obj.routeId, set: (obj, value) => { obj.routeId = value; } }, metadata: _metadata }, _routeId_initializers, _routeId_extraInitializers);
            __esDecorate(null, null, _busId_decorators, { kind: "field", name: "busId", static: false, private: false, access: { has: obj => "busId" in obj, get: obj => obj.busId, set: (obj, value) => { obj.busId = value; } }, metadata: _metadata }, _busId_initializers, _busId_extraInitializers);
            __esDecorate(null, null, _choferId_decorators, { kind: "field", name: "choferId", static: false, private: false, access: { has: obj => "choferId" in obj, get: obj => obj.choferId, set: (obj, value) => { obj.choferId = value; } }, metadata: _metadata }, _choferId_initializers, _choferId_extraInitializers);
            __esDecorate(null, null, _fechaSalida_decorators, { kind: "field", name: "fechaSalida", static: false, private: false, access: { has: obj => "fechaSalida" in obj, get: obj => obj.fechaSalida, set: (obj, value) => { obj.fechaSalida = value; } }, metadata: _metadata }, _fechaSalida_initializers, _fechaSalida_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        routeId = __runInitializers(this, _routeId_initializers, void 0);
        busId = (__runInitializers(this, _routeId_extraInitializers), __runInitializers(this, _busId_initializers, void 0));
        choferId = (__runInitializers(this, _busId_extraInitializers), __runInitializers(this, _choferId_initializers, void 0));
        fechaSalida = (__runInitializers(this, _choferId_extraInitializers), __runInitializers(this, _fechaSalida_initializers, void 0));
        constructor() {
            __runInitializers(this, _fechaSalida_extraInitializers);
        }
    };
})();
export { CreateTripDto };
