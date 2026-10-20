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
import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
let AdminController = (() => {
    let _classDecorators = [Controller('admin'), Roles(Role.ADMIN)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _dashboard_decorators;
    let _revenueByBus_decorators;
    let _topRoutes_decorators;
    let _topPassengers_decorators;
    let _alerts_decorators;
    var AdminController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dashboard_decorators = [Get('dashboard')];
            _revenueByBus_decorators = [Get('revenue/by-bus')];
            _topRoutes_decorators = [Get('reports/top-routes')];
            _topPassengers_decorators = [Get('reports/top-passengers')];
            _alerts_decorators = [Get('alerts')];
            __esDecorate(this, null, _dashboard_decorators, { kind: "method", name: "dashboard", static: false, private: false, access: { has: obj => "dashboard" in obj, get: obj => obj.dashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _revenueByBus_decorators, { kind: "method", name: "revenueByBus", static: false, private: false, access: { has: obj => "revenueByBus" in obj, get: obj => obj.revenueByBus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _topRoutes_decorators, { kind: "method", name: "topRoutes", static: false, private: false, access: { has: obj => "topRoutes" in obj, get: obj => obj.topRoutes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _topPassengers_decorators, { kind: "method", name: "topPassengers", static: false, private: false, access: { has: obj => "topPassengers" in obj, get: obj => obj.topPassengers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _alerts_decorators, { kind: "method", name: "alerts", static: false, private: false, access: { has: obj => "alerts" in obj, get: obj => obj.alerts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminService = __runInitializers(this, _instanceExtraInitializers);
        constructor(adminService) {
            this.adminService = adminService;
        }
        dashboard(fechaInicio, fechaFin) {
            return this.adminService.dashboard(fechaInicio, fechaFin);
        }
        revenueByBus(fechaInicio, fechaFin) {
            return this.adminService.revenueByBus(fechaInicio, fechaFin);
        }
        topRoutes(limite, fechaInicio, fechaFin) {
            return this.adminService.topRoutes(limite ? parseInt(limite, 10) : 10, fechaInicio, fechaFin);
        }
        topPassengers(limite, fechaInicio, fechaFin) {
            return this.adminService.topPassengers(limite ? parseInt(limite, 10) : 10, fechaInicio, fechaFin);
        }
        alerts() {
            return this.adminService.alerts();
        }
    };
    return AdminController = _classThis;
})();
export { AdminController };
