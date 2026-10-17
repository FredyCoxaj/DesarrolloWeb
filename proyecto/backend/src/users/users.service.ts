import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Listar usuarios sin exponer contraseñas
  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dpi: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        fechaNacimiento: true,
        esMenor: true,
        rol: true,
        pncStatus: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  // Consultar un usuario por su ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        dpi: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        fechaNacimiento: true,
        esMenor: true,
        rol: true,
        pncStatus: true,
        pncVerificadoEn: true,
        fotoUrl: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado`,
      );
    }

    return user;
  }
}