import { UnauthenticatedResponse } from "./exceptions";
import { cookies } from 'next/headers';
import { JwtPayload, verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import config from '@/app/(backend)/config';

/**
 * Extract Refresh Token from Cookie
 * @param cookie - Cookie header
 * @returns Refresh token or null if not found
 */
export const extractToken = (cookie: string, key: string) => {
  const refreshToken = cookie?.split(`${key}=`)[1]?.split(";")[0] || null;
  if (!refreshToken) {
    throw new UnauthenticatedResponse("Unauthorized");
  }
  return refreshToken;
};

export async function getUserFromRequest() {
  try {
    const cookieStore = await cookies(); // Add await here
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }
    
    // Use your existing config values
    const decoded = verify(accessToken, config.JWT_ACCESS_SECRET) as JwtPayload;
    
    if (!decoded || !decoded.id) {
      return null;
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
