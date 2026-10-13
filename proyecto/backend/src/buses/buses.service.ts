import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { UpdateBusEstadoDto } from './dto/update-bus-estado.dto';

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(estado?: string) {
    return this.prisma.bus.findMany({
      where: estado ? { estado: estado as any } : undefined,
      orderBy: { placa: 'asc' },
      include: {
        _count: { select: { trips: true } },
      },
    });
  }

  async findOne(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: {
        _count: { select: { trips: true } },
      },
    });

    if (!bus) {
      throw new NotFoundException(`Bus con id ${id} no encontrado`);
    }

    return bus;
  }

  async create(dto: CreateBusDto) {
    const existente = await this.prisma.bus.findUnique({
      where: { placa: dto.placa },
    });
    if (existente) {
      throw new ConflictException('Ya existe un bus con esa placa');
    }

    // Calcular filas/columnas por defecto si no vienen
    const capacidad = dto.capacidad;
    const columnas = dto.columnas ?? 4;
    const filas = dto.filas ?? Math.ceil(capacidad / columnas);

    const bus = await this.prisma.bus.create({
      data: {
        ...dto,
        filas,
        columnas,
      },
    });

    this.logger.log(` Bus creado: ${bus.placa}`);
    return bus;
  }

  async update(id: string, dto: UpdateBusDto) {
    await this.findOne(id);

    if (dto.placa) {
      const existente = await this.prisma.bus.findUnique({
        where: { placa: dto.placa },
      });
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe un bus con esa placa');
      }
    }

    return this.prisma.bus.update({
      where: { id },
      data: dto,
    });
  }

  async cambiarEstado(id: string, dto: UpdateBusEstadoDto) {
    const bus = await this.findOne(id);

    if (bus.estado === dto.estado) {
      throw new BadRequestException(`El bus ya está en estado ${dto.estado}`);
    }

    const actualizado = await this.prisma.bus.update({
      where: { id },
      data: { estado: dto.estado },
    });

    this.logger.log(` Bus ${bus.placa}: ${bus.estado} → ${dto.estado}`);
    return actualizado;
  }

  async remove(id: string) {
    await this.findOne(id);

    const viajesActivos = await this.prisma.trip.count({
      where: {
        busId: id,
        estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
      },
    });

    if (viajesActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar: el bus tiene ${viajesActivos} viaje(s) activo(s)`,
      );
    }

    await this.prisma.bus.delete({ where: { id } });
    this.logger.log(` Bus eliminado: ${id}`);
    return { message: 'Bus eliminado correctamente' };
  }
}