import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "secret";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; role: string };

    if (req.nextUrl.pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
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
