import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsUUID('4', { message: 'tripId debe ser un UUID válido' })
  tripId: string;

  @IsInt()
  @Min(1, { message: 'El asiento debe ser mayor a 0' })
  asiento: number;

  @IsUUID('4', { message: 'paradaSubidaId debe ser un UUID válido' })
  paradaSubidaId: string;

  @IsUUID('4', { message: 'paradaBajadaId debe ser un UUID válido' })
  paradaBajadaId: string;
}