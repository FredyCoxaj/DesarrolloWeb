import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { BusEstado } from '@prisma/client';

export class CreateBusDto {
  @IsString()
  @MinLength(4, { message: 'La placa debe tener al menos 4 caracteres' })
  placa: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  anio?: number;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser al menos 1' })
  capacidad: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  filas?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  columnas?: number;

  @IsOptional()
  @IsEnum(BusEstado)
  estado?: BusEstado;
}