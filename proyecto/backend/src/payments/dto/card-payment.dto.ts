import { IsUUID, IsString, Length, Matches } from 'class-validator';

export class CardPaymentDto {
  @IsUUID('4', { message: 'ticketId debe ser un UUID válido' })
  ticketId: string;

  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Número de tarjeta inválido' })
  numeroTarjeta: string;

  @IsString()
  @Length(3, 4, { message: 'CVV inválido' })
  cvv: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Fecha de expiración debe ser MM/AA',
  })
  fechaExpiracion: string;

  @IsString()
  @Length(2, 100)
  titular: string;
}