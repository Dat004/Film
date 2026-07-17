import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_COOKIE } from '@/features/auth/lib/auth-constants';

export function proxy(request: NextRequest) {
  const isLoggedSession = request.cookies.get(AUTH_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/user') && !isLoggedSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*'],
};
