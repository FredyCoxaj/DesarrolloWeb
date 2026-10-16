import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'DPI guatemalteco (13 dígitos)',
    example: '1111111111111',
  })
  @IsString()
  @Length(13, 13, { message: 'El DPI debe tener 13 dígitos' })
  @Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })
  dpi: string;

  @ApiProperty({ example: 'RutaBus2026!', description: 'Contraseña' })
  @IsString()
  password: string;
}