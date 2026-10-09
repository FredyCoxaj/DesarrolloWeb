import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error desconocido';

      if (error.status === 0) {
        message = 'No hay conexión con el servidor';
      } else if (error.status === 401) {
        message = 'Sesión expirada, inicia sesión de nuevo';
        localStorage.clear();
      } else if (error.status === 403) {
        message = 'No tienes permiso para esta acción';
      } else if (error.status === 404) {
        message = 'Recurso no encontrado';
      } else if (error.status >= 500) {
        message = 'Error del servidor';
      } else if (error.error?.message) {
        message = error.error.message;
      }

      console.error('[HTTP Error]', error.status, message);
      return throwError(() => new Error(message));
    })
  );
};