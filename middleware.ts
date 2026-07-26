import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // If trying to access /admin routes without a session and not on login page
  if (!adminSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // If user has a session and tries to go to login page, redirect to admin dashboard
  if (adminSession && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all /admin routes
  matcher: "/admin/:path*",
};
