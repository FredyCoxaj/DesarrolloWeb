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
import { IsUUID, IsString, MinLength } from 'class-validator';
let BankPaymentDto = (() => {
    let _ticketId_decorators;
    let _ticketId_initializers = [];
    let _ticketId_extraInitializers = [];
    let _banco_decorators;
    let _banco_initializers = [];
    let _banco_extraInitializers = [];
    let _numeroCuenta_decorators;
    let _numeroCuenta_initializers = [];
    let _numeroCuenta_extraInitializers = [];
    let _titular_decorators;
    let _titular_initializers = [];
    let _titular_extraInitializers = [];
    return class BankPaymentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ticketId_decorators = [IsUUID('4', { message: 'ticketId debe ser un UUID válido' })];
            _banco_decorators = [IsString(), MinLength(3)];
            _numeroCuenta_decorators = [IsString(), MinLength(5)];
            _titular_decorators = [IsString(), MinLength(3)];
            __esDecorate(null, null, _ticketId_decorators, { kind: "field", name: "ticketId", static: false, private: false, access: { has: obj => "ticketId" in obj, get: obj => obj.ticketId, set: (obj, value) => { obj.ticketId = value; } }, metadata: _metadata }, _ticketId_initializers, _ticketId_extraInitializers);
            __esDecorate(null, null, _banco_decorators, { kind: "field", name: "banco", static: false, private: false, access: { has: obj => "banco" in obj, get: obj => obj.banco, set: (obj, value) => { obj.banco = value; } }, metadata: _metadata }, _banco_initializers, _banco_extraInitializers);
            __esDecorate(null, null, _numeroCuenta_decorators, { kind: "field", name: "numeroCuenta", static: false, private: false, access: { has: obj => "numeroCuenta" in obj, get: obj => obj.numeroCuenta, set: (obj, value) => { obj.numeroCuenta = value; } }, metadata: _metadata }, _numeroCuenta_initializers, _numeroCuenta_extraInitializers);
            __esDecorate(null, null, _titular_decorators, { kind: "field", name: "titular", static: false, private: false, access: { has: obj => "titular" in obj, get: obj => obj.titular, set: (obj, value) => { obj.titular = value; } }, metadata: _metadata }, _titular_initializers, _titular_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        ticketId = __runInitializers(this, _ticketId_initializers, void 0);
        banco = (__runInitializers(this, _ticketId_extraInitializers), __runInitializers(this, _banco_initializers, void 0));
        numeroCuenta = (__runInitializers(this, _banco_extraInitializers), __runInitializers(this, _numeroCuenta_initializers, void 0));
        titular = (__runInitializers(this, _numeroCuenta_extraInitializers), __runInitializers(this, _titular_initializers, void 0));
        constructor() {
            __runInitializers(this, _titular_extraInitializers);
        }
    };
})();
export { BankPaymentDto };
