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
import { Injectable, Logger, ConflictException, UnauthorizedException, BadRequestException, } from '@nestjs/common';
import { Role, PncStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwtService;
        pncService;
        logger = new Logger(AuthService.name);
        SALT_ROUNDS = 10;
        constructor(prisma, jwtService, pncService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
            this.pncService = pncService;
        }
        // ============================================
        // REGISTRO
        // ============================================
        async register(dto) {
            this.logger.log(` Registro solicitado para DPI: ${dto.dpi}`);
            // 1. Verificar si el DPI ya está registrado
            const existente = await this.prisma.user.findUnique({
                where: { dpi: dto.dpi },
            });
            if (existente) {
                throw new ConflictException('El DPI ya está registrado');
            }
            // 2. Verificar email si viene
            if (dto.email) {
                const emailExiste = await this.prisma.user.findUnique({
                    where: { email: dto.email },
                });
                if (emailExiste) {
                    throw new ConflictException('El email ya está registrado');
                }
            }
            // 3. Verificar en PNC (mock)
            const pncResult = await this.pncService.verificarAntecedentes(dto.dpi);
            if (pncResult.tieneAntecedentes) {
                this.logger.warn(` Registro rechazado por antecedentes: ${dto.dpi}`);
                throw new BadRequestException('No se puede completar el registro: el DPI tiene antecedentes penales.');
            }
            // 4. Determinar si es menor de edad
            let esMenor = false;
            let tutorId = null;
            if (dto.fechaNacimiento) {
                const fechaNac = new Date(dto.fechaNacimiento);
                const edad = this.calcularEdad(fechaNac);
                esMenor = edad < 18;
                // Si es menor, requerir tutor
                if (esMenor) {
                    if (!dto.tutorDpi) {
                        throw new BadRequestException('Si el pasajero es menor de edad, debe indicar el DPI del tutor responsable');
                    }
                    const tutor = await this.prisma.user.findUnique({
                        where: { dpi: dto.tutorDpi },
                    });
                    if (!tutor) {
                        throw new BadRequestException('El DPI del tutor no está registrado en el sistema');
                    }
                    if (tutor.esMenor) {
                        throw new BadRequestException('El tutor responsable no puede ser menor de edad');
                    }
                    tutorId = tutor.id;
                }
            }
            // 5. Hashear contraseña
            const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
            // 6. Crear usuario
            const user = await this.prisma.user.create({
                data: {
                    dpi: dto.dpi,
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    email: dto.email,
                    telefono: dto.telefono,
                    passwordHash,
                    fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
                    esMenor,
                    tutorId,
                    rol: Role.PASAJERO, // Por defecto pasajero (los roles se asignan internamente)
                    pncStatus: PncStatus.VERIFICADO,
                    pncVerificadoEn: pncResult.verificadoEn,
                },
            });
            this.logger.log(` Usuario creado: ${user.dpi}`);
            // 7. Generar JWT
            return this.buildAuthResponse(user);
        }
        // ============================================
        // LOGIN
        // ============================================
        async login(dto) {
            this.logger.log(` Login solicitado para DPI: ${dto.dpi}`);
            // 1. Buscar usuario
            const user = await this.prisma.user.findUnique({
                where: { dpi: dto.dpi },
            });
            if (!user) {
                throw new UnauthorizedException('Credenciales inválidas');
            }
            if (!user.activo) {
                throw new UnauthorizedException('Cuenta desactivada');
            }
            // 2. Verificar contraseña
            const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
            if (!passwordOk) {
                throw new UnauthorizedException('Credenciales inválidas');
            }
            this.logger.log(` Login exitoso: ${user.dpi}`);
            return this.buildAuthResponse(user);
        }
        // ============================================
        // HELPERS
        // ============================================
        calcularEdad(fechaNac) {
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNac.getFullYear();
            const m = hoy.getMonth() - fechaNac.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                edad--;
            }
            return edad;
        }
        buildAuthResponse(user) {
            const payload = {
                sub: user.id,
                dpi: user.dpi,
                rol: user.rol,
            };
            return {
                accessToken: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    dpi: user.dpi,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    telefono: user.telefono,
                    rol: user.rol,
                    pncStatus: user.pncStatus,
                    esMenor: user.esMenor,
                },
            };
        }
    };
    return AuthService = _classThis;
})();
export { AuthService };
