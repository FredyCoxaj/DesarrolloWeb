import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  Min,
  IsArray,
  ValidateNested,
  IsLatitude,
  IsLongitude,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouteStopDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsNumber()
  @IsLatitude({ message: 'Latitud inválida' })
  latitud: number;

  @IsNumber()
  @IsLongitude({ message: 'Longitud inválida' })
  longitud: number;

  @IsInt()
  @Min(1)
  orden: number;

  @IsOptional()
  @IsBoolean()
  esTerminal?: boolean;
}

export class CreateRouteDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  @MinLength(2)
  origen: string;

  @IsString()
  @MinLength(2)
  destino: string;

  @IsNumber()
  @Min(0)
  precioBase: number;

  @IsInt()
  @Min(1)
  duracionMin: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopDto)
  stops?: CreateRouteStopDto[];
}