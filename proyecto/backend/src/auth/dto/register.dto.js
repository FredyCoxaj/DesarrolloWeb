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
import { IsString, IsEmail, IsOptional, Length, Matches, IsDateString, MinLength, } from 'class-validator';
let RegisterDto = (() => {
    let _dpi_decorators;
    let _dpi_initializers = [];
    let _dpi_extraInitializers = [];
    let _nombre_decorators;
    let _nombre_initializers = [];
    let _nombre_extraInitializers = [];
    let _apellido_decorators;
    let _apellido_initializers = [];
    let _apellido_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _telefono_decorators;
    let _telefono_initializers = [];
    let _telefono_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _fechaNacimiento_decorators;
    let _fechaNacimiento_initializers = [];
    let _fechaNacimiento_extraInitializers = [];
    let _tutorDpi_decorators;
    let _tutorDpi_initializers = [];
    let _tutorDpi_extraInitializers = [];
    return class RegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dpi_decorators = [IsString(), Length(13, 13, { message: 'El DPI debe tener exactamente 13 dígitos' }), Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })];
            _nombre_decorators = [IsString(), MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })];
            _apellido_decorators = [IsString(), MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })];
            _email_decorators = [IsOptional(), IsEmail({}, { message: 'El email no es válido' })];
            _telefono_decorators = [IsOptional(), IsString(), Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos' })];
            _password_decorators = [IsString(), MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })];
            _fechaNacimiento_decorators = [IsOptional(), IsDateString({}, { message: 'La fecha debe estar en formato ISO' })];
            _tutorDpi_decorators = [IsOptional(), IsString(), Length(13, 13, { message: 'El DPI del tutor debe tener 13 dígitos' })];
            __esDecorate(null, null, _dpi_decorators, { kind: "field", name: "dpi", static: false, private: false, access: { has: obj => "dpi" in obj, get: obj => obj.dpi, set: (obj, value) => { obj.dpi = value; } }, metadata: _metadata }, _dpi_initializers, _dpi_extraInitializers);
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: obj => "nombre" in obj, get: obj => obj.nombre, set: (obj, value) => { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _apellido_decorators, { kind: "field", name: "apellido", static: false, private: false, access: { has: obj => "apellido" in obj, get: obj => obj.apellido, set: (obj, value) => { obj.apellido = value; } }, metadata: _metadata }, _apellido_initializers, _apellido_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _telefono_decorators, { kind: "field", name: "telefono", static: false, private: false, access: { has: obj => "telefono" in obj, get: obj => obj.telefono, set: (obj, value) => { obj.telefono = value; } }, metadata: _metadata }, _telefono_initializers, _telefono_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _fechaNacimiento_decorators, { kind: "field", name: "fechaNacimiento", static: false, private: false, access: { has: obj => "fechaNacimiento" in obj, get: obj => obj.fechaNacimiento, set: (obj, value) => { obj.fechaNacimiento = value; } }, metadata: _metadata }, _fechaNacimiento_initializers, _fechaNacimiento_extraInitializers);
            __esDecorate(null, null, _tutorDpi_decorators, { kind: "field", name: "tutorDpi", static: false, private: false, access: { has: obj => "tutorDpi" in obj, get: obj => obj.tutorDpi, set: (obj, value) => { obj.tutorDpi = value; } }, metadata: _metadata }, _tutorDpi_initializers, _tutorDpi_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        dpi = __runInitializers(this, _dpi_initializers, void 0);
        nombre = (__runInitializers(this, _dpi_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
        apellido = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _apellido_initializers, void 0));
        email = (__runInitializers(this, _apellido_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        telefono = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _telefono_initializers, void 0));
        password = (__runInitializers(this, _telefono_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        fechaNacimiento = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _fechaNacimiento_initializers, void 0));
        tutorDpi = (__runInitializers(this, _fechaNacimiento_extraInitializers), __runInitializers(this, _tutorDpi_initializers, void 0));
        constructor() {
            __runInitializers(this, _tutorDpi_extraInitializers);
        }
    };
})();
export { RegisterDto };
