import jwt from "jsonwebtoken";
import { IAuthService, Payload } from "../interfaces/IAuthService";
import config from "../config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

class AuthService implements IAuthService {
  generateAccessToken(payload: Payload): string {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES,
    });
  }

  async generateRefreshToken(payload: Payload): Promise<string> {
    const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES,
    });
    const hashedToken = await bcrypt.hash(token, 10);
    await prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: payload.id,
      },
    });
    return token;
  }

  verifyToken(token: string, secret: string): Payload | null {
    try {
      return jwt.verify(token, secret) as Payload;
    } catch {
      return null;
    }
  }

  putRefreshTokenInCookie(response: NextResponse, token: string): NextResponse {
    response.cookies.set("refresh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: config.JWT_REFRESH_EXPIRES,
    });
    return response;
  }
}

// Singleton Instance
class AuthServiceSingleton {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthServiceSingleton.instance) {
      AuthServiceSingleton.instance = new AuthService();
    }
    return AuthServiceSingleton.instance;
  }
}

const authService = AuthServiceSingleton.getInstance();
export default authService;
