import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import * as jose from "jose";
import { totalRequests } from "@backend/utils/metrics";

type ROLE = "ADMIN" | "BUSINESS_ANALYST";

interface UserJwtPayload {
  id: string;
  email: string;
  role: ROLE;
  exp?: number;
  iat?: number;
}

interface RoleConfig {
  defaultPath: string;
  restrictedPaths: string[];
}

// Constants
const FIVE_MINUTES_IN_SECONDS = 300;

const AUTH_ROUTES = {
  LOGIN: "/login",
  API_LOGIN: "/api/auth/login",
  API_LOGOUT: "/api/auth/logout",
  API_VERIFY: "/api/auth/token/verify",
  API_REFRESH: "/api/auth/token/refresh",
};

const ROLE_REDIRECTS: Record<ROLE, RoleConfig> = {
  ADMIN: {
    defaultPath: "/admin",
    restrictedPaths: ["/"],
  },
  BUSINESS_ANALYST: {
    defaultPath: "/",
    restrictedPaths: ["/admin"],
  },
};

// Token management functions
export async function verifyAccessToken(
  token: string
): Promise<UserJwtPayload | null> {
  try {
    const secretEnv = process.env.JWT_ACCESS_SECRET;
    if (!secretEnv) {
      throw new Error("JWT secret is not defined in environment variables.");
    }
    const secret = new TextEncoder().encode(secretEnv);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserJwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function refreshAccessToken(
  req: NextRequest,
  refreshToken: string
): Promise<string | null> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? req.nextUrl.origin}${
      AUTH_ROUTES.API_REFRESH
    }`;
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!apiResponse.ok) return null;

    const data = await apiResponse.json();
    return data.data.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
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

const API_ACCESS_RULES: Record<ROLE, Record<string, string[]>> = {
  ADMIN: {
    GET: ["/users", "/service", "/schema", "/ai"],
    POST: ["/users", "/service", "/schema"],
    PATCH: ["/users", "/schema", "/ai"],
    DELETE: ["/users", "/service", "/schema"],
  },
  BUSINESS_ANALYST: {
    GET: ["/service", "/schema", "/chat-session", "/ai"],
    POST: ["/chat", "/ekspor", "/chat-session"],
    PATCH: ["/chat-session"],
    DELETE: ["/chat-session"],
  }
};

function checkApiAccess(
  pathname: string,
  role: ROLE,
  method: string
): NextResponse | null {
  const path = pathname.replace(/^\/api/, '');
  const allowedPaths = API_ACCESS_RULES[role]?.[method] || [];
  
  // Check if there's a matching path
  const hasAccess = allowedPaths.some(allowedPath => 
    path === allowedPath || path.startsWith(`${allowedPath}/`)
  );
  
  if (!hasAccess) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  
  return null;
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

async function handleBackgroundTokenRefresh(
  req: NextRequest,
  refreshToken: string
): Promise<void> {
  if (refreshToken) {
    await refreshAccessToken(req, refreshToken);
  }
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  console.log("Middleware triggered for path:", pathname);

  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  console.log("Middleware triggered for path:", isAuthRoute(pathname));

  let accessToken = req.cookies.get("access_token")?.value ?? null;
  const refreshToken = req.cookies.get("refresh_token")?.value ?? null;

  let user = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!user && refreshToken) {
    accessToken = await refreshAccessToken(req, refreshToken);
    user = accessToken ? await verifyAccessToken(accessToken) : null;
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(AUTH_ROUTES.LOGIN, req.nextUrl.origin)
    );
  }

  if (user.exp && isTokenAboutToExpire(user.exp)) {
    event.waitUntil(handleBackgroundTokenRefresh(req, refreshToken ?? ""));
  }

  if (isApiRoute(pathname)) {
    totalRequests.inc({ method: req.method });
    event.waitUntil(logAccess(user.id, pathname, user.role));
    const accessResult = checkApiAccess(pathname, user.role, req.method);
    if (accessResult) return accessResult;
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
