import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión.';
            // Opcional: redirigir al login
            // inject(Router).navigate(['/login']);
            break;
          case 403:
            errorMessage = 'No tienes permiso para acceder a este recurso.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
        }
      }
      
      // Log del error para debugging
      console.error('Error interceptor:', {
        url: req.url,
        status: error.status,
        message: errorMessage,
        error: error
      });
      
      // Aquí puedes enviar el error a un servicio de logging si es necesario
      // inject(LoggingService).logError(error);
      
      return throwError(() => error);
    })
  );
};
