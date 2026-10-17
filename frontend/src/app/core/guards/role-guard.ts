import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const raw = localStorage.getItem('rutabus_user');

  if (!raw) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(raw);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.includes(user.rol)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};