import { IsUUID, IsString, MinLength } from 'class-validator';

export class BankPaymentDto {
  @IsUUID('4', { message: 'ticketId debe ser un UUID válido' })
  ticketId: string;

  @IsString()
  @MinLength(3)
  banco: string;

  @IsString()
  @MinLength(5)
  numeroCuenta: string;

  @IsString()
  @MinLength(3)
  titular: string;
}