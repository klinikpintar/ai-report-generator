import {
  middleware,
  verifyAccessToken,
  refreshAccessToken,
} from "@/middleware";
import { NextRequest } from "next/server";

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

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows access to /login without auth", async () => {
    const { req, event } = createMockRequest("/login");
    const response = await middleware(req, event as any);
    expect(response.status).toBe(200);
  });

  it("redirects to /login if no tokens are present", async () => {
    const { req, event } = createMockRequest("/admin");
    (verifyAccessToken as jest.Mock).mockResolvedValue(null);

    const response = await middleware(req, event as any);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
  });

  it("returns null if refresh token response is not ok", async () => {
    const { refreshAccessToken: realRefreshAccessToken } =
      jest.requireActual("@/middleware");

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });

    const token = await realRefreshAccessToken("dummy_refresh_token");
    expect(token).toBeNull();
  });

  it("returns null if refresh token fetch throws", async () => {
    const { refreshAccessToken: realRefreshAccessToken } =
      jest.requireActual("@/middleware");

    global.fetch = jest.fn().mockRejectedValueOnce(new Error("network error"));

    const token = await realRefreshAccessToken("dummy_refresh_token");
    expect(token).toBeNull();
  });

  it("refreshes token in background if it's about to expire", async () => {
    const { req, event } = createMockRequest("/admin", {
      access_token: "valid",
      refresh_token: "refresh",
    });

    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "u1",
      role: "ADMIN",
      email: "admin@example.com",
      exp: Math.floor(Date.now() / 1000) + 60, // about to expire
    });

    const response = await middleware(req, event as any);
    expect(response.status).toBe(200);
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it("redirects BUSINESS_ANALYST from /admin to /", async () => {
    const { req, event } = createMockRequest("/admin", {
      access_token: "valid",
    });

    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "u2",
      email: "ba@example.com",
      role: "BUSINESS_ANALYST",
    });

    const response = await middleware(req, event as any);
    expect(response.status).toBe(200);
  });

  it("returns 200 for valid ADMIN access to /admin", async () => {
    const { req, event } = createMockRequest("/admin", {
      access_token: "valid",
    });

    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "u3",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const response = await middleware(req, event as any);
    expect(response.status).toBe(200);
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it("logs access for API route", async () => {
    const { req, event } = createMockRequest("/api/any-endpoint", {
      access_token: "valid",
    });

    (verifyAccessToken as jest.Mock).mockResolvedValue({
      id: "u4",
      email: "api@example.com",
      role: "ADMIN",
    });

    const response = await middleware(req, event as any);
    expect(response.status).toBe(200);
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it("calls refreshAccessToken and verify again if access token is initially invalid", async () => {
    const { req, event } = createMockRequest("/admin", {
      refresh_token: "valid_refresh_token",
    });

    (verifyAccessToken as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "u5",
        email: "admin@example.com",
        role: "ADMIN",
      });

    (refreshAccessToken as jest.Mock).mockResolvedValue("new_access_token");

    const response = await middleware(req, event as any);
    expect(response.status).toBe(307);
  });
});
