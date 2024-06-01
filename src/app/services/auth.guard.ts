import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.checkIfAuthenticated) {
    const router = inject(Router);
    router.navigate(['/settings']);
    return false;
  }
  return true;
};
