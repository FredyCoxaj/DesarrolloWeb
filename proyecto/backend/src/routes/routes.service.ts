import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // LISTAR TODAS LAS RUTAS (público)
  // ============================================
  async findAll(soloActivas = false) {
    return this.prisma.route.findMany({
      where: soloActivas ? { activa: true } : undefined,
      include: {
        stops: { orderBy: { orden: 'asc' } },
        _count: { select: { trips: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  // ============================================
  // OBTENER UNA RUTA (con paradas)
  // ============================================
  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { orden: 'asc' } },
      },
    });

    if (!route) {
      throw new NotFoundException(`Ruta con id ${id} no encontrada`);
    }

    return route;
  }

  // ============================================
  // CREAR RUTA (admin) - CON ALGORITMO DE DISTANCIA
  // ============================================
  async create(dto: CreateRouteDto) {
    const { stops, ...routeData } = dto;

    // Validar que no exista otra ruta con el mismo nombre
    const existente = await this.prisma.route.findFirst({
      where: { nombre: dto.nombre },
    });
    if (existente) {
      throw new BadRequestException('Ya existe una ruta con ese nombre');
    }

    // Validar orden de paradas y calcular distancia automática
    if (stops && stops.length > 1) {
      const ordenes = stops.map((s) => s.orden);
      const ordenesUnicos = new Set(ordenes);
      if (ordenes.length !== ordenesUnicos.size) {
        throw new BadRequestException('Los órdenes de paradas no pueden repetirse');
      }

      // Si no viene precio o duración, los calculamos automáticamente
      const distancia = this.calcularDistanciaTotal(stops);
      
      if (!routeData.precioBase || routeData.precioBase === 0) {
        routeData.precioBase = Math.round(distancia * 2.5 * 100) / 100; // Q2.5/km
      }
      if (!routeData.duracionMin || routeData.duracionMin === 0) {
        routeData.duracionMin = Math.ceil(distancia * 2); // 2 min/km
      }
    }

    const route = await this.prisma.route.create({
      data: {
        ...routeData,
        stops: stops
          ? {
              create: stops.map((s) => ({
                nombre: s.nombre,
                latitud: s.latitud,
                longitud: s.longitud,
                orden: s.orden,
                esTerminal: s.esTerminal ?? false,
              })),
            }
          : undefined,
      },
      include: { stops: { orderBy: { orden: 'asc' } } },
    });

    this.logger.log(`✅ Ruta creada: ${route.nombre}`);
    
    // Devolvemos también la distancia total calculada
    const distanciaTotal = stops && stops.length > 1 ? this.calcularDistanciaTotal(stops) : 0;
    
    return { ...route, distanciaTotalKm: distanciaTotal };
  }

  // ============================================
  // ACTUALIZAR RUTA (admin)
  // ============================================
  async update(id: string, dto: UpdateRouteDto) {
    await this.findOne(id); // valida existencia

    const { stops, ...routeData } = dto;

    if (stops) {
      return this.prisma.$transaction(async (tx) => {
        await tx.routeStop.deleteMany({ where: { routeId: id } });

        return tx.route.update({
          where: { id },
          data: {
            ...routeData,
            stops: {
              create: stops.map((s) => ({
                nombre: s.nombre,
                latitud: s.latitud,
                longitud: s.longitud,
                orden: s.orden,
                esTerminal: s.esTerminal ?? false,
              })),
            },
          },
          include: { stops: { orderBy: { orden: 'asc' } } },
        });
      });
    }

    return this.prisma.route.update({
      where: { id },
      data: routeData,
      include: { stops: { orderBy: { orden: 'asc' } } },
    });
  }

  // ============================================
  // ELIMINAR RUTA (admin)
  // ============================================
  async remove(id: string) {
    await this.findOne(id);

    const viajesActivos = await this.prisma.trip.count({
      where: {
        routeId: id,
        estado: { in: ['PROGRAMADO', 'EN_CURSO'] },
      },
    });

    if (viajesActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar: hay ${viajesActivos} viaje(s) activo(s) usando esta ruta`,
      );
    }

    await this.prisma.route.delete({ where: { id } });
    this.logger.log(`🗑️ Ruta eliminada: ${id}`);
    return { message: 'Ruta eliminada correctamente' };
  }

  // ============================================
  // CALCULAR PRECIO POR TRAMO
  // ============================================
  async calcularPrecio(routeId: string, paradaSubidaId: string, paradaBajadaId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: true },
    });

    if (!route) {
      throw new NotFoundException(`Ruta ${routeId} no encontrada`);
    }

    const subida = route.stops.find((s) => s.id === paradaSubidaId);
    const bajada = route.stops.find((s) => s.id === paradaBajadaId);

    if (!subida || !bajada) {
      throw new BadRequestException('Parada de subida o bajada no válida');
    }

    if (subida.orden >= bajada.orden) {
      throw new BadRequestException(
        'La parada de bajada debe estar después de la de subida',
      );
    }

    const totalParadas = route.stops.length - 1;
    const tramoRecorrido = bajada.orden - subida.orden;
    const proporcion = tramoRecorrido / totalParadas;

    const precio = Math.round(Number(route.precioBase) * proporcion * 100) / 100;

    return {
      routeId,
      paradaSubida: { id: subida.id, nombre: subida.nombre, orden: subida.orden },
      paradaBajada: { id: bajada.id, nombre: bajada.nombre, orden: bajada.orden },
      precioTotal: Number(route.precioBase),
      tramoRecorrido,
      totalParadas,
      precioCalculado: precio,
    };
  }

  // ============================================
  // ALGORITMO DE DISTANCIA (Haversine)
  // ============================================
  
  private calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private calcularDistanciaTotal(stops: any[]): number {
    let distanciaTotal = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      distanciaTotal += this.calcularDistanciaHaversine(
        stops[i].latitud,
        stops[i].longitud,
        stops[i + 1].latitud,
        stops[i + 1].longitud,
      );
    }
    return Math.round(distanciaTotal * 100) / 100;
  }

  async calcularDistanciaRuta(stops: any[]) {
    if (!stops || stops.length < 2) {
      throw new BadRequestException('Se necesitan al menos 2 paradas para calcular la distancia');
    }
    const distancia = this.calcularDistanciaTotal(stops);
    return {
      distanciaKm: distancia,
      precioSugerido: Math.round(distancia * 2.5 * 100) / 100, // Q2.50 por km
      duracionSugeridaMin: Math.ceil(distancia * 2), // 2 minutos por km
    };
  }
}