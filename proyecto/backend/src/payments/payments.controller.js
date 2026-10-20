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
import { Controller, Get, Post, HttpCode, HttpStatus, } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
let PaymentsController = (() => {
    let _classDecorators = [Controller('payments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _cash_decorators;
    let _card_decorators;
    let _bank_decorators;
    let _myPayments_decorators;
    let _byTrip_decorators;
    let _summary_decorators;
    var PaymentsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cash_decorators = [Roles(Role.CHOFER), Post('cash'), HttpCode(HttpStatus.CREATED)];
            _card_decorators = [Post('card'), HttpCode(HttpStatus.CREATED)];
            _bank_decorators = [Post('bank'), HttpCode(HttpStatus.CREATED)];
            _myPayments_decorators = [Get('my-payments')];
            _byTrip_decorators = [Roles(Role.CHOFER, Role.ADMIN), Get('trip/:tripId')];
            _summary_decorators = [Roles(Role.ADMIN), Get('summary/:busId/:fecha')];
            __esDecorate(this, null, _cash_decorators, { kind: "method", name: "cash", static: false, private: false, access: { has: obj => "cash" in obj, get: obj => obj.cash }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _card_decorators, { kind: "method", name: "card", static: false, private: false, access: { has: obj => "card" in obj, get: obj => obj.card }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _bank_decorators, { kind: "method", name: "bank", static: false, private: false, access: { has: obj => "bank" in obj, get: obj => obj.bank }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _myPayments_decorators, { kind: "method", name: "myPayments", static: false, private: false, access: { has: obj => "myPayments" in obj, get: obj => obj.myPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _byTrip_decorators, { kind: "method", name: "byTrip", static: false, private: false, access: { has: obj => "byTrip" in obj, get: obj => obj.byTrip }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _summary_decorators, { kind: "method", name: "summary", static: false, private: false, access: { has: obj => "summary" in obj, get: obj => obj.summary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(paymentsService) {
            this.paymentsService = paymentsService;
        }
        // CHOFER: cobro en efectivo
        cash(dto, user) {
            return this.paymentsService.cash(dto, user.id);
        }
        // PASAJERO: pagar con tarjeta
        card(dto, user) {
            return this.paymentsService.card(dto, user.id);
        }
        // PASAJERO: pagar con cuenta bancaria
        bank(dto, user) {
            return this.paymentsService.bank(dto, user.id);
        }
        // PASAJERO: mi historial de pagos
        myPayments(user) {
            return this.paymentsService.myPayments(user.id);
        }
        // CHOFER/ADMIN: pagos de un viaje
        byTrip(tripId, user) {
            return this.paymentsService.byTrip(tripId, user.id, user.rol);
        }
        // ADMIN: resumen por bus y fecha
        summary(busId, fecha) {
            return this.paymentsService.summaryByBusAndDate(busId, fecha);
        }
    };
    return PaymentsController = _classThis;
})();
export { PaymentsController };
