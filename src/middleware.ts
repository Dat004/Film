import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const loggedSession = request.cookies.get("is_logged_session");
  const { pathname } = request.nextUrl;

  // Protect any user profile, settings or continue watching routes
  if (pathname.startsWith("/user") && !loggedSession) {
    // Redirect to main page if unauthenticated
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*"],
};
