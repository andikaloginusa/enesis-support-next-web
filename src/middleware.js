import { NextResponse } from "next/server";
import { ROUTES } from "@/utils/constants";

/**
 * Next.js Server-Side Middleware Route Guard
 * Since middleware runs on the server (Edge runtime), it cannot access localStorage.
 * It reads the secure 'user_token' cookie set during login to protect/allow routes instantly.
 */
export function middleware(request) {
  const { nextUrl, cookies } = request;
  const token = cookies.get("user_token")?.value;
  const path = nextUrl.pathname;

  // 1. Identify static files and API requests to bypass guarding
  const isStaticOrApi =
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") ||
    path.startsWith("/public");

  if (isStaticOrApi) {
    return NextResponse.next();
  }

  // 2. Identify auth paths (login, signup, password reset)
  const isAuthPath =
    path.startsWith("/auth/login-1") ||
    path.startsWith("/auth/signup-1");

  // 3. User is NOT authenticated (cookie is missing)
  if (!token) {
    if (!path.startsWith("/auth")) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }
  // 4. User IS authenticated (cookie is present)
  else {
    if (isAuthPath) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
