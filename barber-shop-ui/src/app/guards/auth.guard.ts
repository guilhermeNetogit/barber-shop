import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../login/service/auth.service';

export class AuthGuard {
  static canActivate: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  };
}
