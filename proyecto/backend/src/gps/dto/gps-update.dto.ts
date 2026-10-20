import { IsNumber, IsOptional, IsUUID, IsString } from 'class-validator';

export class GpsUpdateDto {
  @IsUUID('4', { message: 'busId debe ser un UUID válido' })
  busId: string;

  @IsUUID('4', { message: 'tripId debe ser un UUID válido' })
  @IsOptional()
  tripId?: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsOptional()
  @IsNumber()
  velocidad?: number;

  @IsOptional()
  @IsNumber()
  rumbo?: number;
}