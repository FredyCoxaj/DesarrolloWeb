export type UserRole = 'PASAJERO' | 'CHOFER' | 'ADMIN';

export interface User {
  id: string;
  dpi: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  dpiVerificado: boolean;
  tutorId?: string;
  fechaNacimiento?: string;
}

export interface RegisterDto {
  dpi: string;
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  fechaNacimiento: string;
  tutorId?: string;
}

export interface LoginDto {
  identifier: string; // DPI o email
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: User;
}