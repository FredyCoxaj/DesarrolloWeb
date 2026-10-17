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
import { Role, BusEstado } from '@prisma/client';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { UpdateBusEstadoDto } from './dto/update-bus-estado.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Public()
  @Get()
  findAll(@Query('estado') estado?: BusEstado) {
    return this.busesService.findAll(estado);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBusDto) {
    return this.busesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusDto) {
    return this.busesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: UpdateBusEstadoDto) {
    return this.busesService.cambiarEstado(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busesService.remove(id);
  }
}