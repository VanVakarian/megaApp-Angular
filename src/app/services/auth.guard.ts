import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export const canActivateAuth: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (!authService.checkIfAuthenticated) {
    const router = inject(Router);
    router.navigate(['/settings']);
    return false;
  }
  return true;
};
