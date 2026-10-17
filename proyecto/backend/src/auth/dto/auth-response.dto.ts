import { Role, PncStatus } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    dpi: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    rol: Role;
    pncStatus: PncStatus;
    esMenor: boolean;
  };
}