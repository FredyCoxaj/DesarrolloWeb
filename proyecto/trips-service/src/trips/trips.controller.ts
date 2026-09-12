import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('rutas')
  obtenerRutas() {
    return this.tripsService.obtenerRutasActivas();
  }

  @Get('disponibles')
  buscarViajes(
    @Query('fecha') fecha: string,
    @Query('rutaId') rutaId?: string,
  ) {
    return this.tripsService.buscarViajesDisponibles(fecha, rutaId);
  }

  @Get('paradas/:rutaId')
  obtenerParadas(@Param('rutaId') rutaId: string) {
    return this.tripsService.obtenerParadas(rutaId);
  }

  @Post('reservar')
  reservarAsiento(
    @Body() body: { usuarioId: string; viajeId: string; numeroAsiento: number }
  ) {
    return this.tripsService.reservarAsiento(
      body.usuarioId,
      body.viajeId,
      body.numeroAsiento
    );
  }

  @Get('usuario/:usuarioId/reservas')
  obtenerReservas(@Param('usuarioId') usuarioId: string) {
    return this.tripsService.obtenerReservasUsuario(usuarioId);
  }
}
