import { NextResponse } from "next/server";
export interface Payload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthService {
  login(email: string, password: string): Promise<{ accessToken: string }>;

  logout(token: string): Promise<void>;

  refreshToken(
    token: string
  ): Promise<{ newAccessToken: string; newRefreshToken: string }>;

  /**
   * Generate Access Token
   * @param payload - Data payload (id, role)
   * @returns {string} Access Token
   */
  generateAccessToken(payload: Payload): string;

  /**
   * Generate Refresh Token
   * @param payload - Data payload (id)
   * @returns {Promise<string>} Refresh Token
   */
  generateRefreshToken(payload: Payload): Promise<string>;

  /**
   * Verify and Decode JWT Token
   * @param token - JWT token to verify
   * @param secret - Secret key to verify the token
   * @returns Decoded payload or null if invalid
   */
  verifyToken(token: string, secret: string): Payload | null;

  /**
   * Put Refresh Token in Cookie
   * @param response - NextResponse object
   * @param token - Refresh token
   * @returns NextResponse object with cookie
   */
  putRefreshTokenInCookie(response: NextResponse, token: string): NextResponse;
}
