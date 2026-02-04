import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const pinGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // Check if PIN is enabled
  const pin = localStorage.getItem('app_pin');

  if (!pin) {
    // No PIN set, allow access to all routes
    return true;
  }

  // Check if user is already authenticated (has entered PIN in this session)
  const authenticated = localStorage.getItem('authenticated') === 'true';

  if (authenticated) {
    return true;
  }

  // If trying to access PIN page itself, allow it
  if (state.url === '/pin') {
    return true;
  }

  // Redirect to PIN entry page
  router.navigate(['/pin']);
  return false;
};
