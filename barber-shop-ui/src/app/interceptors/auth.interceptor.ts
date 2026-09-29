import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../login/service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const router = inject(Router);

  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // status === 0: Backend fora do ar / Servidor caiu
      // status === 401: Não autorizado / Token inválido
      if (error.status === 0 || error.status === 401) {
        if (typeof authService.logout === 'function') {
          authService.logout();
        } else {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
