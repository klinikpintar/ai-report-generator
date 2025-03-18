import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyAccessToken(req: NextRequest, token: string) {
  try {
    const apiResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/token/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!apiResponse.ok) throw new Error("Token verification failed");

    const data = await apiResponse.json();
    console.log(data.data.user);
    return data.data.user;
  } catch {
    return null;
  }
}

async function refreshAccessToken(req: NextRequest, refreshToken: string) {
  try {
    const apiResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refresh_token=${refreshToken}`,
        },
      }
    );

    if (!apiResponse.ok) throw new Error("Failed to refresh token");

    const data = await apiResponse.json();
    console.log(data.data.access_token);
    return data.data.access_token;
  } catch {
    return null;
  }
}

function getRedirectURL(role: string, pathname: string) {
  if (role === "ADMIN" && !pathname.startsWith("/admin")) return "/admin";
  if (role !== "ADMIN" && pathname.startsWith("/admin")) return "/";
  return null;
}

export async function middleware(req: NextRequest) {
  let accessToken = req.cookies.get("access_token")?.value ?? null;
  const refreshToken = req.cookies.get("refresh_token")?.value ?? null;
  let decodedAccess = accessToken
    ? await verifyAccessToken(req, accessToken)
    : null;

  if (!decodedAccess && refreshToken) {
    accessToken = await refreshAccessToken(req, refreshToken);
    decodedAccess = accessToken
      ? await verifyAccessToken(req, accessToken)
      : null;
  }

  if (!decodedAccess)
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));

  const redirectURL = getRedirectURL(decodedAccess.role, req.nextUrl.pathname);
  if (redirectURL)
    return NextResponse.redirect(new URL(redirectURL, req.nextUrl.origin));

  return NextResponse.next();
}

// ditambahkan url path yang lainnya
export const config = {
  matcher: ["/", "/admin/:path*"],
};
