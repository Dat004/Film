'use client';

import { AUTH_COOKIE } from './auth-constants';

/**
 * Set or clear the authentication cookie used by middleware
 * to protect server-side routes.
 */
export function setAuthCookie(value: boolean): void {
  if (typeof document === 'undefined') return;

  if (value) {
    document.cookie = `${AUTH_COOKIE}=true; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  }
}
