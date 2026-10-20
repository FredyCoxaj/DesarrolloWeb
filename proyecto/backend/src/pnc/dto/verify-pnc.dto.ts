import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPncDto {
  @ApiProperty({ description: 'DPI de 13 dígitos a verificar', example: '1234567890123' })
  @IsString()
  @Length(13, 13, { message: 'El DPI debe tener 13 dígitos' })
  @Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })
  dpi: string;
}