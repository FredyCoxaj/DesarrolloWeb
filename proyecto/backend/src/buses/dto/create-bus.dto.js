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
import { IsString, IsOptional, IsInt, IsEnum, Min, Max, MinLength, } from 'class-validator';
import { BusEstado } from '@prisma/client';
let CreateBusDto = (() => {
    let _placa_decorators;
    let _placa_initializers = [];
    let _placa_extraInitializers = [];
    let _marca_decorators;
    let _marca_initializers = [];
    let _marca_extraInitializers = [];
    let _modelo_decorators;
    let _modelo_initializers = [];
    let _modelo_extraInitializers = [];
    let _anio_decorators;
    let _anio_initializers = [];
    let _anio_extraInitializers = [];
    let _capacidad_decorators;
    let _capacidad_initializers = [];
    let _capacidad_extraInitializers = [];
    let _filas_decorators;
    let _filas_initializers = [];
    let _filas_extraInitializers = [];
    let _columnas_decorators;
    let _columnas_initializers = [];
    let _columnas_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    return class CreateBusDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _placa_decorators = [IsString(), MinLength(4, { message: 'La placa debe tener al menos 4 caracteres' })];
            _marca_decorators = [IsOptional(), IsString()];
            _modelo_decorators = [IsOptional(), IsString()];
            _anio_decorators = [IsOptional(), IsInt(), Min(1990), Max(new Date().getFullYear() + 1)];
            _capacidad_decorators = [IsInt(), Min(1, { message: 'La capacidad debe ser al menos 1' })];
            _filas_decorators = [IsOptional(), IsInt(), Min(1)];
            _columnas_decorators = [IsOptional(), IsInt(), Min(1)];
            _estado_decorators = [IsOptional(), IsEnum(BusEstado)];
            __esDecorate(null, null, _placa_decorators, { kind: "field", name: "placa", static: false, private: false, access: { has: obj => "placa" in obj, get: obj => obj.placa, set: (obj, value) => { obj.placa = value; } }, metadata: _metadata }, _placa_initializers, _placa_extraInitializers);
            __esDecorate(null, null, _marca_decorators, { kind: "field", name: "marca", static: false, private: false, access: { has: obj => "marca" in obj, get: obj => obj.marca, set: (obj, value) => { obj.marca = value; } }, metadata: _metadata }, _marca_initializers, _marca_extraInitializers);
            __esDecorate(null, null, _modelo_decorators, { kind: "field", name: "modelo", static: false, private: false, access: { has: obj => "modelo" in obj, get: obj => obj.modelo, set: (obj, value) => { obj.modelo = value; } }, metadata: _metadata }, _modelo_initializers, _modelo_extraInitializers);
            __esDecorate(null, null, _anio_decorators, { kind: "field", name: "anio", static: false, private: false, access: { has: obj => "anio" in obj, get: obj => obj.anio, set: (obj, value) => { obj.anio = value; } }, metadata: _metadata }, _anio_initializers, _anio_extraInitializers);
            __esDecorate(null, null, _capacidad_decorators, { kind: "field", name: "capacidad", static: false, private: false, access: { has: obj => "capacidad" in obj, get: obj => obj.capacidad, set: (obj, value) => { obj.capacidad = value; } }, metadata: _metadata }, _capacidad_initializers, _capacidad_extraInitializers);
            __esDecorate(null, null, _filas_decorators, { kind: "field", name: "filas", static: false, private: false, access: { has: obj => "filas" in obj, get: obj => obj.filas, set: (obj, value) => { obj.filas = value; } }, metadata: _metadata }, _filas_initializers, _filas_extraInitializers);
            __esDecorate(null, null, _columnas_decorators, { kind: "field", name: "columnas", static: false, private: false, access: { has: obj => "columnas" in obj, get: obj => obj.columnas, set: (obj, value) => { obj.columnas = value; } }, metadata: _metadata }, _columnas_initializers, _columnas_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        placa = __runInitializers(this, _placa_initializers, void 0);
        marca = (__runInitializers(this, _placa_extraInitializers), __runInitializers(this, _marca_initializers, void 0));
        modelo = (__runInitializers(this, _marca_extraInitializers), __runInitializers(this, _modelo_initializers, void 0));
        anio = (__runInitializers(this, _modelo_extraInitializers), __runInitializers(this, _anio_initializers, void 0));
        capacidad = (__runInitializers(this, _anio_extraInitializers), __runInitializers(this, _capacidad_initializers, void 0));
        filas = (__runInitializers(this, _capacidad_extraInitializers), __runInitializers(this, _filas_initializers, void 0));
        columnas = (__runInitializers(this, _filas_extraInitializers), __runInitializers(this, _columnas_initializers, void 0));
        estado = (__runInitializers(this, _columnas_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
        constructor() {
            __runInitializers(this, _estado_extraInitializers);
        }
    };
})();
export { CreateBusDto };
