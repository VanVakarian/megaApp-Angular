import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const canActivateAuth: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
  return true;
};
