import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CashPaymentDto {
  @IsUUID('4', { message: 'ticketId debe ser un UUID válido' })
  ticketId: string;

  @IsOptional()
  @IsString()
  notas?: string;
}