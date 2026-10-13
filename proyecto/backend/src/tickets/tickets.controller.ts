import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // PÚBLICO: ver asientos ocupados/libres de un viaje
  @Public()
  @Get('trip/:tripId/seats')
  asientos(@Param('tripId') tripId: string) {
    return this.ticketsService.asientosDeViaje(tripId);
  }

  // PASAJERO: reservar
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(dto, user.id);
  }

  // PASAJERO: mis tickets
  @Get('my-tickets')
  myTickets(@CurrentUser() user: any) {
    return this.ticketsService.myTickets(user.id);
  }

  // PASAJERO: detalle de un ticket
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  // PASAJERO: pagar
  @Post(':id/pay')
  pagar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.pagar(id, user.id);
  }

  // CHOFER o ADMIN: validar abordaje (escaneo de QR)
  @Roles(Role.CHOFER, Role.ADMIN)
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.validarAbordaje(dto, user.id, user.rol);
  }

  // PASAJERO o ADMIN: cancelar
  @Patch(':id/cancel')
  cancelar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.cancelar(id, user.id, user.rol);
  }
}