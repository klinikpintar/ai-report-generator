import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import * as jose from "jose";

type ROLE = "ADMIN" | "BUSINESS_ANALYST";

interface UserJwtPayload {
  id: string;
  email: string;
  role: ROLE;
  exp?: number;
  iat?: number;
}

const AUTH_ROUTES = {
  LOGIN: "/login",
  API_LOGIN: "/api/auth/login",
  API_REFRESH: "/api/auth/token/refresh",
};

const ROLE_REDIRECTS = {
  ADMIN: {
    defaultPath: "/admin",
    restrictedPaths: ["/"],
  },
  BUSINESS_ANALYST: {
    defaultPath: "/",
    restrictedPaths: ["/admin"],
  },
};

const FIVE_MINUTES_IN_SECONDS = 300;

export async function verifyAccessToken(
  token: string
): Promise<UserJwtPayload | null> {
  try {
    const secretEnv = process.env.JWT_ACCESS_SECRET;
    if (!secretEnv) throw new Error("JWT_ACCESS_SECRET is not defined.");
    const secret = new TextEncoder().encode(secretEnv);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as UserJwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${AUTH_ROUTES.API_REFRESH}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refresh_token=${refreshToken}`,
        },
      }
    );
    if (!apiResponse.ok) return null;

    const data = await apiResponse.json();
    return data.data.access_token;
  } catch {
    return null;
  }
}

function isAuthRoute(pathname: string): boolean {
  return Object.values(AUTH_ROUTES).some((route) => pathname.includes(route));
}

function isApiRoute(pathname: string): boolean {
  return pathname.includes("/api/");
}

function isTokenAboutToExpire(expTimestamp: number): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return expTimestamp - currentTime < FIVE_MINUTES_IN_SECONDS;
}

async function logAccess(
  userId: string,
  path: string,
  role: ROLE
): Promise<void> {
  try {
    console.log(
      `User ${userId} (${role}) accessed ${path} at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("Failed to log access:", error);
  }
}

function getRedirectURL(role: ROLE, pathname: string): string | null {
  const roleConfig = ROLE_REDIRECTS[role] || ROLE_REDIRECTS.BUSINESS_ANALYST;

  const isRestrictedPath = roleConfig.restrictedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isRestrictedPath) return roleConfig.defaultPath;

  if (role === "ADMIN" && !pathname.startsWith("/admin")) {
    return roleConfig.defaultPath;
  }

  return null;
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  let accessToken = req.cookies.get("access_token")?.value ?? null;
  const refreshToken = req.cookies.get("refresh_token")?.value ?? null;

  let user = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!user && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken);
    user = accessToken ? await verifyAccessToken(accessToken) : null;
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(AUTH_ROUTES.LOGIN, req.nextUrl.origin)
    );
  }

  // Background token refresh if needed
  if (user.exp && isTokenAboutToExpire(user.exp)) {
    event.waitUntil(
      (async () => {
        if (refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          console.log("Token refreshed in background:", !!newAccessToken);
          // Optionally: save to cookie if Next.js supports modifying response here
        }
      })()
    );
  }

  if (isApiRoute(pathname)) {
    event.waitUntil(logAccess(user.id, pathname, user.role));
    return NextResponse.next();
  }

  const redirectURL = getRedirectURL(user.role, pathname);
  if (redirectURL && redirectURL !== pathname) {
    return NextResponse.redirect(new URL(redirectURL, req.nextUrl.origin));
  }

  event.waitUntil(logAccess(user.id, pathname, user.role));

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/:path*"],
};
