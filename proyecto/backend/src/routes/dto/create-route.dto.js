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
import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, Min, IsArray, ValidateNested, IsLatitude, IsLongitude, IsInt, } from 'class-validator';
import { Type } from 'class-transformer';
let CreateRouteStopDto = (() => {
    let _nombre_decorators;
    let _nombre_initializers = [];
    let _nombre_extraInitializers = [];
    let _latitud_decorators;
    let _latitud_initializers = [];
    let _latitud_extraInitializers = [];
    let _longitud_decorators;
    let _longitud_initializers = [];
    let _longitud_extraInitializers = [];
    let _orden_decorators;
    let _orden_initializers = [];
    let _orden_extraInitializers = [];
    let _esTerminal_decorators;
    let _esTerminal_initializers = [];
    let _esTerminal_extraInitializers = [];
    return class CreateRouteStopDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [IsString(), MinLength(2)];
            _latitud_decorators = [IsNumber(), IsLatitude({ message: 'Latitud inválida' })];
            _longitud_decorators = [IsNumber(), IsLongitude({ message: 'Longitud inválida' })];
            _orden_decorators = [IsInt(), Min(1)];
            _esTerminal_decorators = [IsOptional(), IsBoolean()];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: obj => "nombre" in obj, get: obj => obj.nombre, set: (obj, value) => { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _latitud_decorators, { kind: "field", name: "latitud", static: false, private: false, access: { has: obj => "latitud" in obj, get: obj => obj.latitud, set: (obj, value) => { obj.latitud = value; } }, metadata: _metadata }, _latitud_initializers, _latitud_extraInitializers);
            __esDecorate(null, null, _longitud_decorators, { kind: "field", name: "longitud", static: false, private: false, access: { has: obj => "longitud" in obj, get: obj => obj.longitud, set: (obj, value) => { obj.longitud = value; } }, metadata: _metadata }, _longitud_initializers, _longitud_extraInitializers);
            __esDecorate(null, null, _orden_decorators, { kind: "field", name: "orden", static: false, private: false, access: { has: obj => "orden" in obj, get: obj => obj.orden, set: (obj, value) => { obj.orden = value; } }, metadata: _metadata }, _orden_initializers, _orden_extraInitializers);
            __esDecorate(null, null, _esTerminal_decorators, { kind: "field", name: "esTerminal", static: false, private: false, access: { has: obj => "esTerminal" in obj, get: obj => obj.esTerminal, set: (obj, value) => { obj.esTerminal = value; } }, metadata: _metadata }, _esTerminal_initializers, _esTerminal_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nombre = __runInitializers(this, _nombre_initializers, void 0);
        latitud = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _latitud_initializers, void 0));
        longitud = (__runInitializers(this, _latitud_extraInitializers), __runInitializers(this, _longitud_initializers, void 0));
        orden = (__runInitializers(this, _longitud_extraInitializers), __runInitializers(this, _orden_initializers, void 0));
        esTerminal = (__runInitializers(this, _orden_extraInitializers), __runInitializers(this, _esTerminal_initializers, void 0));
        constructor() {
            __runInitializers(this, _esTerminal_extraInitializers);
        }
    };
})();
export { CreateRouteStopDto };
let CreateRouteDto = (() => {
    let _nombre_decorators;
    let _nombre_initializers = [];
    let _nombre_extraInitializers = [];
    let _descripcion_decorators;
    let _descripcion_initializers = [];
    let _descripcion_extraInitializers = [];
    let _origen_decorators;
    let _origen_initializers = [];
    let _origen_extraInitializers = [];
    let _destino_decorators;
    let _destino_initializers = [];
    let _destino_extraInitializers = [];
    let _precioBase_decorators;
    let _precioBase_initializers = [];
    let _precioBase_extraInitializers = [];
    let _duracionMin_decorators;
    let _duracionMin_initializers = [];
    let _duracionMin_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _activa_decorators;
    let _activa_initializers = [];
    let _activa_extraInitializers = [];
    let _stops_decorators;
    let _stops_initializers = [];
    let _stops_extraInitializers = [];
    return class CreateRouteDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [IsString(), MinLength(3)];
            _descripcion_decorators = [IsOptional(), IsString()];
            _origen_decorators = [IsString(), MinLength(2)];
            _destino_decorators = [IsString(), MinLength(2)];
            _precioBase_decorators = [IsNumber(), Min(0)];
            _duracionMin_decorators = [IsInt(), Min(1)];
            _color_decorators = [IsOptional(), IsString()];
            _activa_decorators = [IsOptional(), IsBoolean()];
            _stops_decorators = [IsOptional(), IsArray(), ValidateNested({ each: true }), Type(() => CreateRouteStopDto)];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: obj => "nombre" in obj, get: obj => obj.nombre, set: (obj, value) => { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: obj => "descripcion" in obj, get: obj => obj.descripcion, set: (obj, value) => { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
            __esDecorate(null, null, _origen_decorators, { kind: "field", name: "origen", static: false, private: false, access: { has: obj => "origen" in obj, get: obj => obj.origen, set: (obj, value) => { obj.origen = value; } }, metadata: _metadata }, _origen_initializers, _origen_extraInitializers);
            __esDecorate(null, null, _destino_decorators, { kind: "field", name: "destino", static: false, private: false, access: { has: obj => "destino" in obj, get: obj => obj.destino, set: (obj, value) => { obj.destino = value; } }, metadata: _metadata }, _destino_initializers, _destino_extraInitializers);
            __esDecorate(null, null, _precioBase_decorators, { kind: "field", name: "precioBase", static: false, private: false, access: { has: obj => "precioBase" in obj, get: obj => obj.precioBase, set: (obj, value) => { obj.precioBase = value; } }, metadata: _metadata }, _precioBase_initializers, _precioBase_extraInitializers);
            __esDecorate(null, null, _duracionMin_decorators, { kind: "field", name: "duracionMin", static: false, private: false, access: { has: obj => "duracionMin" in obj, get: obj => obj.duracionMin, set: (obj, value) => { obj.duracionMin = value; } }, metadata: _metadata }, _duracionMin_initializers, _duracionMin_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: obj => "activa" in obj, get: obj => obj.activa, set: (obj, value) => { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
            __esDecorate(null, null, _stops_decorators, { kind: "field", name: "stops", static: false, private: false, access: { has: obj => "stops" in obj, get: obj => obj.stops, set: (obj, value) => { obj.stops = value; } }, metadata: _metadata }, _stops_initializers, _stops_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nombre = __runInitializers(this, _nombre_initializers, void 0);
        descripcion = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
        origen = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _origen_initializers, void 0));
        destino = (__runInitializers(this, _origen_extraInitializers), __runInitializers(this, _destino_initializers, void 0));
        precioBase = (__runInitializers(this, _destino_extraInitializers), __runInitializers(this, _precioBase_initializers, void 0));
        duracionMin = (__runInitializers(this, _precioBase_extraInitializers), __runInitializers(this, _duracionMin_initializers, void 0));
        color = (__runInitializers(this, _duracionMin_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        activa = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
        stops = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _stops_initializers, void 0));
        constructor() {
            __runInitializers(this, _stops_extraInitializers);
        }
    };
})();
export { CreateRouteDto };
