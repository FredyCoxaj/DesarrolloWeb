import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Viaje } from './entities/viaje.entity';
import { Ruta } from './entities/ruta.entity';
import { Reserva } from './entities/reserva.entity';
import { Parada } from './entities/parada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Viaje, Ruta, Reserva, Parada])],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
