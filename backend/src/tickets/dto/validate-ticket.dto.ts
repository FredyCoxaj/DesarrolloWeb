import { IsString, MinLength } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  @MinLength(10, { message: 'El código QR es inválido' })
  qrCode: string;
}