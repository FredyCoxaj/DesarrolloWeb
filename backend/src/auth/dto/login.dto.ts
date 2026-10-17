import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(13, 13, { message: 'El DPI debe tener 13 dígitos' })
  @Matches(/^\d{13}$/, { message: 'El DPI solo debe contener números' })
  dpi: string;

  @IsString()
  password: string;
}