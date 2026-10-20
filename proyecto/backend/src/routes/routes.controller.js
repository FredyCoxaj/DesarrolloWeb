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
import { Controller, Get, Post, Patch, Delete, HttpCode, HttpStatus, } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
let RoutesController = (() => {
    let _classDecorators = [Controller('routes')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _calcularPrecio_decorators;
    let _findOne_decorators;
    let _create_decorators;
    let _update_decorators;
    let _remove_decorators;
    var RoutesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [Public(), Get()];
            _calcularPrecio_decorators = [Public(), Get(':id/precio')];
            _findOne_decorators = [Public(), Get(':id')];
            _create_decorators = [Roles(Role.ADMIN), Post(), HttpCode(HttpStatus.CREATED)];
            _update_decorators = [Roles(Role.ADMIN), Patch(':id')];
            _remove_decorators = [Roles(Role.ADMIN), Delete(':id')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calcularPrecio_decorators, { kind: "method", name: "calcularPrecio", static: false, private: false, access: { has: obj => "calcularPrecio" in obj, get: obj => obj.calcularPrecio }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RoutesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        routesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(routesService) {
            this.routesService = routesService;
        }
        // ============================================
        // LISTAR RUTAS (público)
        // ============================================
        findAll(soloActivas) {
            return this.routesService.findAll(soloActivas === 'true');
        }
        // ============================================
        // CALCULAR PRECIO POR TRAMO (público)
        // ============================================
        calcularPrecio(id, subidaId, bajadaId) {
            return this.routesService.calcularPrecio(id, subidaId, bajadaId);
        }
        // ============================================
        // OBTENER RUTA POR ID (público)
        // ============================================
        findOne(id) {
            return this.routesService.findOne(id);
        }
        // ============================================
        // CREAR RUTA (solo ADMIN)
        // ============================================
        create(dto) {
            return this.routesService.create(dto);
        }
        // ============================================
        // ACTUALIZAR RUTA (solo ADMIN)
        // ============================================
        update(id, dto) {
            return this.routesService.update(id, dto);
        }
        // ============================================
        // ELIMINAR RUTA (solo ADMIN)
        // ============================================
        remove(id) {
            return this.routesService.remove(id);
        }
    };
    return RoutesController = _classThis;
})();
export { RoutesController };
