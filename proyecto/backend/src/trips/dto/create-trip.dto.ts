import { IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateTripDto {
  @IsUUID('4', { message: 'routeId debe ser un UUID válido' })
  routeId: string;

  @IsUUID('4', { message: 'busId debe ser un UUID válido' })
  busId: string;

  @IsUUID('4', { message: 'choferId debe ser un UUID válido' })
  choferId: string;

  @IsDateString({}, { message: 'La fecha debe estar en formato ISO' })
  fechaSalida: string;
}