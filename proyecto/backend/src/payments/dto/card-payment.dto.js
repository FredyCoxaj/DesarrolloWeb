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
import { IsUUID, IsString, Length, Matches } from 'class-validator';
let CardPaymentDto = (() => {
    let _ticketId_decorators;
    let _ticketId_initializers = [];
    let _ticketId_extraInitializers = [];
    let _numeroTarjeta_decorators;
    let _numeroTarjeta_initializers = [];
    let _numeroTarjeta_extraInitializers = [];
    let _cvv_decorators;
    let _cvv_initializers = [];
    let _cvv_extraInitializers = [];
    let _fechaExpiracion_decorators;
    let _fechaExpiracion_initializers = [];
    let _fechaExpiracion_extraInitializers = [];
    let _titular_decorators;
    let _titular_initializers = [];
    let _titular_extraInitializers = [];
    return class CardPaymentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ticketId_decorators = [IsUUID('4', { message: 'ticketId debe ser un UUID válido' })];
            _numeroTarjeta_decorators = [IsString(), Matches(/^\d{13,19}$/, { message: 'Número de tarjeta inválido' })];
            _cvv_decorators = [IsString(), Length(3, 4, { message: 'CVV inválido' })];
            _fechaExpiracion_decorators = [IsString(), Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
                    message: 'Fecha de expiración debe ser MM/AA',
                })];
            _titular_decorators = [IsString(), Length(2, 100)];
            __esDecorate(null, null, _ticketId_decorators, { kind: "field", name: "ticketId", static: false, private: false, access: { has: obj => "ticketId" in obj, get: obj => obj.ticketId, set: (obj, value) => { obj.ticketId = value; } }, metadata: _metadata }, _ticketId_initializers, _ticketId_extraInitializers);
            __esDecorate(null, null, _numeroTarjeta_decorators, { kind: "field", name: "numeroTarjeta", static: false, private: false, access: { has: obj => "numeroTarjeta" in obj, get: obj => obj.numeroTarjeta, set: (obj, value) => { obj.numeroTarjeta = value; } }, metadata: _metadata }, _numeroTarjeta_initializers, _numeroTarjeta_extraInitializers);
            __esDecorate(null, null, _cvv_decorators, { kind: "field", name: "cvv", static: false, private: false, access: { has: obj => "cvv" in obj, get: obj => obj.cvv, set: (obj, value) => { obj.cvv = value; } }, metadata: _metadata }, _cvv_initializers, _cvv_extraInitializers);
            __esDecorate(null, null, _fechaExpiracion_decorators, { kind: "field", name: "fechaExpiracion", static: false, private: false, access: { has: obj => "fechaExpiracion" in obj, get: obj => obj.fechaExpiracion, set: (obj, value) => { obj.fechaExpiracion = value; } }, metadata: _metadata }, _fechaExpiracion_initializers, _fechaExpiracion_extraInitializers);
            __esDecorate(null, null, _titular_decorators, { kind: "field", name: "titular", static: false, private: false, access: { has: obj => "titular" in obj, get: obj => obj.titular, set: (obj, value) => { obj.titular = value; } }, metadata: _metadata }, _titular_initializers, _titular_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        ticketId = __runInitializers(this, _ticketId_initializers, void 0);
        numeroTarjeta = (__runInitializers(this, _ticketId_extraInitializers), __runInitializers(this, _numeroTarjeta_initializers, void 0));
        cvv = (__runInitializers(this, _numeroTarjeta_extraInitializers), __runInitializers(this, _cvv_initializers, void 0));
        fechaExpiracion = (__runInitializers(this, _cvv_extraInitializers), __runInitializers(this, _fechaExpiracion_initializers, void 0));
        titular = (__runInitializers(this, _fechaExpiracion_extraInitializers), __runInitializers(this, _titular_initializers, void 0));
        constructor() {
            __runInitializers(this, _titular_extraInitializers);
        }
    };
})();
export { CardPaymentDto };
