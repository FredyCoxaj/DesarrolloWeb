export type UserRole = 'PASAJERO' | 'CHOFER' | 'ADMIN';
export type PncStatus = 'PENDIENTE' | 'VERIFICADO' | 'CON_ANTECEDENTES' | 'RECHAZADO';

export interface User {
  id: string;
  dpi: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  rol: UserRole;
  pncStatus: PncStatus;
  esMenor: boolean;
  fechaNacimiento?: string;
  tutorDpi?: string;
  fotoUrl?: string;
  activo?: boolean;
}

export interface RegisterDto {
  dpi: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  password: string;
  fechaNacimiento?: string;
  tutorDpi?: string;
}

export interface LoginDto {
  dpi: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: User;
}