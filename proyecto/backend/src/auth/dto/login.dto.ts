import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ required: false, example: '1111111111111' })
  @IsOptional()
  @IsString()
  dpi?: string;

  @ApiProperty({ required: false, description: 'Puede ser DPI o correo', example: '1111111111111' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: 'RutaBus2026!' })
  @IsString()
  password: string;
}