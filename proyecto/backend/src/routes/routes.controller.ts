import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // ============================================
  // LISTAR RUTAS (público)
  // ============================================
  @Public()
  @Get()
  findAll(@Query('soloActivas') soloActivas?: string) {
    return this.routesService.findAll(soloActivas === 'true');
  }

  // ============================================
  // CALCULAR DISTANCIA DE RUTA (público)
  // ============================================
  @Public()
  @Post('calcular-distancia')
  @HttpCode(HttpStatus.OK)
  calcularDistancia(@Body() stops: any[]) {
    return this.routesService.calcularDistanciaRuta(stops);
  }

  // ============================================
  // GENERAR CAMINO DE CALLES CON DIJKSTRA (público)
  // ============================================
  @Public()
  @Post('camino-calles')
  @HttpCode(HttpStatus.OK)
  generarCaminoCalles(@Body() stops: any[]) {
    return this.routesService.generarCaminoCalles(stops);
  }

  // ============================================
  // OBTENER CAMINO DE CALLES DE UNA RUTA (público)
  // ============================================
  @Public()
  @Get(':id/camino')
  generarCaminoRuta(@Param('id') id: string) {
    return this.routesService.generarCaminoRuta(id);
  }


  // ============================================
  // CALCULAR PRECIO POR TRAMO (público)
  // ============================================
  @Public()
  @Get(':id/precio')
  calcularPrecio(
    @Param('id') id: string,
    @Query('subida') subidaId: string,
    @Query('bajada') bajadaId: string,
  ) {
    return this.routesService.calcularPrecio(id, subidaId, bajadaId);
  }

  // ============================================
  // OBTENER RUTA POR ID (público)
  // ============================================
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  // ============================================
  // CREAR RUTA (solo ADMIN)
  // ============================================
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  // ============================================
  // ACTUALIZAR RUTA (solo ADMIN)
  // ============================================
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routesService.update(id, dto);
  }

  // ============================================
  // ELIMINAR RUTA (solo ADMIN)
  // ============================================
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}