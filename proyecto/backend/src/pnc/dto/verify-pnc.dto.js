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
import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
let VerifyPncDto = (() => {
    let _dpi_decorators;
    let _dpi_initializers = [];
    let _dpi_extraInitializers = [];
    return class VerifyPncDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dpi_decorators = [ApiProperty({ description: 'DPI de 13 dígitos a verificar', example: '1234567890123' }), IsString(), Length(13, 13, { message: 'El DPI debe tener 13 dígitos' }), Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })];
            __esDecorate(null, null, _dpi_decorators, { kind: "field", name: "dpi", static: false, private: false, access: { has: obj => "dpi" in obj, get: obj => obj.dpi, set: (obj, value) => { obj.dpi = value; } }, metadata: _metadata }, _dpi_initializers, _dpi_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        dpi = __runInitializers(this, _dpi_initializers, void 0);
        constructor() {
            __runInitializers(this, _dpi_extraInitializers);
        }
    };
})();
export { VerifyPncDto };
