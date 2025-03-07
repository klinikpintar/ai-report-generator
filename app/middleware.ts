import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractToken } from "./utils/authUtils";
import authService from "./services/authService";
import appConfig from "./config";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = extractToken(authHeader ?? "");
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = authService.verifyToken(token, appConfig.JWT_ACCESS_SECRET);

    if (
      req.nextUrl.pathname.startsWith("/api/admin") &&
      decoded?.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
}

// **Menentukan route yang akan diproteksi**
export const config = {
  matcher: [
    "/api/protected/:path*", // Proteksi semua API di "/api/protected/"
    "/api/admin/:path*", // Proteksi khusus admin di "/api/admin/"
  ],
};