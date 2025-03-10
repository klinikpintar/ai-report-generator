import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  return NextResponse.next();
}

// **Apply middleware to protected routes**
export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/admin/:path*"], // Protect home, dashboard, and admin API routes
};
