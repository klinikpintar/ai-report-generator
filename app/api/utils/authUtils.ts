import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

/**
 * Verify and Decode JWT Token
 * @param token - JWT token to verify
 * @param secret - Secret key to verify the token
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as jwt.JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Get User by ID
 * @param userId - ID of the user
 * @returns User object or null
 */
export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({ where: { id: userId } });
};

/**
 * Extract JWT Token from Authorization Header
 * @param authHeader - Authorization header
 * @returns JWT token or null if not found
 */
export const extractToken = (authHeader: string) => {
  return authHeader?.split(" ")[1] || null;
};

/**
 * Extract Refresh Token from Cookie
 * @param cookie - Cookie header
 * @returns Refresh token or null if not found
 */
export const extractRefreshToken = (cookie: string) => {
  return cookie?.split("refresh_token=")[1]?.split(";")[0] || null;
};
