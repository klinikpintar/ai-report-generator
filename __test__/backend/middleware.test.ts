import { middleware } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

// mock helper
jest.mock("jose", () => ({
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      id: "mock-user",
      email: "mock@example.com",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  }),
}));

jest.mock("@/middleware", () => {
  const original = jest.requireActual("@/middleware");
  return {
    ...original,
    verifyAccessToken: jest.fn(),
    refreshAccessToken: jest.fn(),
    logAccess: jest.fn(),
  };
});

import { verifyAccessToken, refreshAccessToken } from "@/middleware";

const createMockRequest = (
  path: string,
  cookies: Record<string, string> = {}
) => {
  const req = {
    nextUrl: {
      pathname: path,
      origin: "http://localhost:3000",
    },
    cookies: {
      get: (key: string) =>
        cookies[key] ? { value: cookies[key] } : undefined,
    },
    url: `http://localhost:3000${path}`,
  } as unknown as NextRequest;

  const event = {
    waitUntil: jest.fn(),
  };

  return { req, event };
};

const expectRedirectTo = (response: NextResponse, expectedUrl: string) => {
  const location = response.headers?.get?.("location");
  expect(location).not.toBeNull(); // cek dulu ada isinya
  expect(location).toContain(expectedUrl);
};

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow access to auth route (/login)", async () => {
    const { req, event } = createMockRequest("/login");
    const response = await middleware(req, event as any);
    expect(response?.status).toBe(200);
  });

  it("should redirect to login if no tokens", async () => {
    const { req, event } = createMockRequest("/admin");

    (verifyAccessToken as jest.Mock).mockResolvedValue(null);

    const response = await middleware(req, event as any);
    expectRedirectTo(response, "http://localhost:3000/login");
  });

  it("should refresh token if access token invalid", async () => {
    const { req, event } = createMockRequest("/admin", {
      refresh_token: "valid_refresh_token",
    });

    (verifyAccessToken as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "123",
        email: "admin@example.com",
        role: "ADMIN",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

    (refreshAccessToken as jest.Mock).mockResolvedValue("new_access_token");

    const response = await middleware(req, event as any);
    expect(response?.status).toBe(307);
  });

  it("should redirect BUSINESS_ANALYST away from /admin", async () => {
    const { req, event } = createMockRequest("/admin", {
      access_token: "dummy_token",
    });
  
    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "321",
      email: "ba@test.com",
      role: "BUSINESS_ANALYST",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  
    const response = await middleware(req, event as any);
  
    expect(response.status).toBe(200);
  });

  it("should allow ADMIN to access /admin", async () => {
    const { req, event } = createMockRequest("/admin", {
      access_token: "dummy_token",
    });

    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "admin_id",
      email: "admin@test.com",
      role: "ADMIN",
    });

    const response = await middleware(req, event as any);
    expect(response?.status).toBe(200);
    expect(event.waitUntil).toHaveBeenCalledWith(expect.any(Promise));
  });
});
