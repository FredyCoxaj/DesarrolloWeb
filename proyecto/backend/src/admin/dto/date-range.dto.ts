import { IsOptional, IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsDateString({}, { message: 'fechaInicio debe estar en formato ISO' })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaFin debe estar en formato ISO' })
  fechaFin?: string;
}