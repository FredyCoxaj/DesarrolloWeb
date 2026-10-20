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
import { IsNumber, IsOptional, IsUUID } from 'class-validator';
let GpsUpdateDto = (() => {
    let _busId_decorators;
    let _busId_initializers = [];
    let _busId_extraInitializers = [];
    let _tripId_decorators;
    let _tripId_initializers = [];
    let _tripId_extraInitializers = [];
    let _latitud_decorators;
    let _latitud_initializers = [];
    let _latitud_extraInitializers = [];
    let _longitud_decorators;
    let _longitud_initializers = [];
    let _longitud_extraInitializers = [];
    let _velocidad_decorators;
    let _velocidad_initializers = [];
    let _velocidad_extraInitializers = [];
    let _rumbo_decorators;
    let _rumbo_initializers = [];
    let _rumbo_extraInitializers = [];
    return class GpsUpdateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _busId_decorators = [IsUUID('4', { message: 'busId debe ser un UUID válido' })];
            _tripId_decorators = [IsUUID('4', { message: 'tripId debe ser un UUID válido' }), IsOptional()];
            _latitud_decorators = [IsNumber()];
            _longitud_decorators = [IsNumber()];
            _velocidad_decorators = [IsOptional(), IsNumber()];
            _rumbo_decorators = [IsOptional(), IsNumber()];
            __esDecorate(null, null, _busId_decorators, { kind: "field", name: "busId", static: false, private: false, access: { has: obj => "busId" in obj, get: obj => obj.busId, set: (obj, value) => { obj.busId = value; } }, metadata: _metadata }, _busId_initializers, _busId_extraInitializers);
            __esDecorate(null, null, _tripId_decorators, { kind: "field", name: "tripId", static: false, private: false, access: { has: obj => "tripId" in obj, get: obj => obj.tripId, set: (obj, value) => { obj.tripId = value; } }, metadata: _metadata }, _tripId_initializers, _tripId_extraInitializers);
            __esDecorate(null, null, _latitud_decorators, { kind: "field", name: "latitud", static: false, private: false, access: { has: obj => "latitud" in obj, get: obj => obj.latitud, set: (obj, value) => { obj.latitud = value; } }, metadata: _metadata }, _latitud_initializers, _latitud_extraInitializers);
            __esDecorate(null, null, _longitud_decorators, { kind: "field", name: "longitud", static: false, private: false, access: { has: obj => "longitud" in obj, get: obj => obj.longitud, set: (obj, value) => { obj.longitud = value; } }, metadata: _metadata }, _longitud_initializers, _longitud_extraInitializers);
            __esDecorate(null, null, _velocidad_decorators, { kind: "field", name: "velocidad", static: false, private: false, access: { has: obj => "velocidad" in obj, get: obj => obj.velocidad, set: (obj, value) => { obj.velocidad = value; } }, metadata: _metadata }, _velocidad_initializers, _velocidad_extraInitializers);
            __esDecorate(null, null, _rumbo_decorators, { kind: "field", name: "rumbo", static: false, private: false, access: { has: obj => "rumbo" in obj, get: obj => obj.rumbo, set: (obj, value) => { obj.rumbo = value; } }, metadata: _metadata }, _rumbo_initializers, _rumbo_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        busId = __runInitializers(this, _busId_initializers, void 0);
        tripId = (__runInitializers(this, _busId_extraInitializers), __runInitializers(this, _tripId_initializers, void 0));
        latitud = (__runInitializers(this, _tripId_extraInitializers), __runInitializers(this, _latitud_initializers, void 0));
        longitud = (__runInitializers(this, _latitud_extraInitializers), __runInitializers(this, _longitud_initializers, void 0));
        velocidad = (__runInitializers(this, _longitud_extraInitializers), __runInitializers(this, _velocidad_initializers, void 0));
        rumbo = (__runInitializers(this, _velocidad_extraInitializers), __runInitializers(this, _rumbo_initializers, void 0));
        constructor() {
            __runInitializers(this, _rumbo_extraInitializers);
        }
    };
})();
export { GpsUpdateDto };
