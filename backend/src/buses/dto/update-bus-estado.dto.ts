import { IsEnum } from 'class-validator';
import { BusEstado } from '@prisma/client';

export class UpdateBusEstadoDto {
  @IsEnum(BusEstado, { message: 'Estado inválido' })
  estado: BusEstado;
}