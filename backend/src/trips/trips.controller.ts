import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // PÚBLICO: listar viajes (con filtros)
  @Public()
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('routeId') routeId?: string,
    @Query('busId') busId?: string,
    @Query('choferId') choferId?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.tripsService.findAll({ estado, routeId, busId, choferId, fecha });
  }

  // PROTEGIDO: solo el chofer asignado, admin o pasajeros con ticket deberían ver detalle
  // Por simplicidad, cualquier usuario autenticado puede ver
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  // PROTEGIDO: lista de pasajeros (chofer asignado o admin)
  @Roles(Role.CHOFER, Role.ADMIN)
  @Get(':id/passengers')
  pasajeros(@Param('id') id: string) {
    return this.tripsService.pasajeros(id);
  }

  // ADMIN: crear viaje
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  // ADMIN: actualizar
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripsService.update(id, dto);
  }

  // CHOFER asignado o ADMIN: iniciar
  @Roles(Role.CHOFER, Role.ADMIN)
  @Patch(':id/start')
  iniciar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripsService.iniciar(id, user.id, user.rol);
  }

  // CHOFER asignado o ADMIN: finalizar
  @Roles(Role.CHOFER, Role.ADMIN)
  @Patch(':id/finish')
  finalizar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripsService.finalizar(id, user.id, user.rol);
  }

  // ADMIN: cancelar
  @Roles(Role.ADMIN)
  @Patch(':id/cancel')
  cancelar(@Param('id') id: string) {
    return this.tripsService.cancelar(id);
  }
}