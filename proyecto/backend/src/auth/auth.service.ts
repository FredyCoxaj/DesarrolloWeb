import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, PncStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { PncService } from './pnc.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly pncService: PncService,
  ) {}

  // ============================================
  // REGISTRO
  // ============================================
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`📝 Registro solicitado para DPI: ${dto.dpi}`);

    const existente = await this.prisma.user.findUnique({
      where: { dpi: dto.dpi },
    });
    if (existente) {
      throw new ConflictException('El DPI ya está registrado');
    }

    if (dto.email) {
      const emailExiste = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExiste) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const pncResult = await this.pncService.verificarAntecedentes(dto.dpi);
    if (pncResult.tieneAntecedentes) {
      this.logger.warn(`⚠️ Registro rechazado por antecedentes: ${dto.dpi}`);
      throw new BadRequestException(
        'No se puede completar el registro: el DPI tiene antecedentes penales.',
      );
    }

    let esMenor = false;
    let tutorId: string | null = null;

    if (dto.fechaNacimiento) {
      const fechaNac = new Date(dto.fechaNacimiento);
      const edad = this.calcularEdad(fechaNac);
      esMenor = edad < 18;

      if (esMenor) {
        if (!dto.tutorDpi) {
          throw new BadRequestException(
            'Si el pasajero es menor de edad, debe indicar el DPI del tutor responsable',
          );
        }

        const tutor = await this.prisma.user.findUnique({
          where: { dpi: dto.tutorDpi },
        });

        if (!tutor) {
          throw new BadRequestException(
            'El DPI del tutor no está registrado en el sistema',
          );
        }

        if (tutor.esMenor) {
          throw new BadRequestException(
            'El tutor responsable no puede ser menor de edad',
          );
        }

        tutorId = tutor.id;
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

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
        rol: Role.PASAJERO,
        pncStatus: PncStatus.VERIFICADO,
        pncVerificadoEn: pncResult.verificadoEn,
      },
    });

    this.logger.log(`✅ Usuario creado: ${user.dpi}`);

    return this.buildAuthResponse(user);
  }

  // ============================================
  // LOGIN (Acepta DPI o Email, y 'dpi' o 'identifier')
  // ============================================
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Aceptamos tanto 'dpi' como 'identifier' (que es como Fredy lo manda)
    const identificador = dto.dpi || dto.identifier;

    if (!identificador) {
      throw new UnauthorizedException('Debe proporcionar un DPI o correo');
    }

    // Convertimos a string por si Angular envía el DPI como número (evita el error de validación)
    const idString = String(identificador);

    this.logger.log(`🔐 Login solicitado para: ${idString}`);

    // Buscar usuario por DPI o Email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { dpi: idString },
          { email: idString },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`✅ Login exitoso: ${user.dpi}`);

    return this.buildAuthResponse(user);
  }

  // ============================================
  // HELPERS
  // ============================================
  private calcularEdad(fechaNac: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

  private buildAuthResponse(user: any): AuthResponseDto {
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
}