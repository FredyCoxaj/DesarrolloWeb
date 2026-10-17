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
      throw new BadRequestException(
        'No se puede completar el registro: el DPI tiene antecedentes penales.',
      );
    }

    // 4. Determinar si es menor de edad
    let esMenor = false;
    let tutorId: string | null = null;

    if (dto.fechaNacimiento) {
      const fechaNac = new Date(dto.fechaNacimiento);
      const edad = this.calcularEdad(fechaNac);
      esMenor = edad < 18;

      // Si es menor, requerir tutor
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
  async login(dto: LoginDto): Promise<AuthResponseDto> {
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