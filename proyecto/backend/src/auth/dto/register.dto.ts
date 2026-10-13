import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  Matches,
  IsDateString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(13, 13, { message: 'El DPI debe tener exactamente 13 dígitos' })
  @Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })
  dpi: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos' })
  telefono?: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'El DPI del tutor debe tener 13 dígitos' })
  tutorDpi?: string;
}