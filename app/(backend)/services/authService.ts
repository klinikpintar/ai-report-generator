import jwt from "jsonwebtoken";
import {
  IAuthService,
  Payload,
  IGenerateToken,
  IVerifyToken,
} from "../interfaces/IAuthService";
import config from "../config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  BadRequestResponse,
  NotFoundResponse,
  UnauthenticatedResponse,
  UnauthorizedResponse,
} from "../utils/exceptions";

class AuthService implements IAuthService, IGenerateToken, IVerifyToken {
  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundResponse("User not found");
    if (!user.isActive) throw new BadRequestResponse("User is not active");

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestResponse("Invalid credentials");
    }

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    const accessToken = this.generateAccessToken({
      id: user.id,
      role: user.role,
    });
    const refreshToken = await this.generateRefreshToken({
      id: user.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    if (!token || !this.verifyToken(token, config.JWT_ACCESS_SECRET)) {
      throw new UnauthenticatedResponse("Invalid or expired access token");
    }

    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async verify(token: string): Promise<Payload> {
    const decoded = this.verifyToken(token, config.JWT_ACCESS_SECRET);
    if (!decoded) {
      throw new UnauthorizedResponse("Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    return user;
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const decoded = authService.verifyToken(
      refreshToken,
      config.JWT_REFRESH_SECRET
    );
    if (!decoded) {
      throw new UnauthorizedResponse("Invalid or expired access token");
    }

    const storedToken = await prisma.refreshToken.findFirst({
      where: { userId: decoded.id },
    });

    if (!storedToken || storedToken.token !== refreshToken) {
      throw new UnauthorizedResponse("Invalid refresh token");
    }

    await prisma.refreshToken.deleteMany({ where: { userId: decoded.id } });
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    const newAccessToken = authService.generateAccessToken({
      id: user!.id,
      role: user!.role,
    });
    const newRefreshToken = await authService.generateRefreshToken({
      id: user!.id,
    });

    return {
      newAccessToken,
      newRefreshToken,
    };
  }

  generateAccessToken(payload: Payload): string {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES,
    });
  }

  async generateRefreshToken(payload: Payload): Promise<string> {
    const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES,
    });
    await prisma.refreshToken.create({
      data: {
        token,
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

  putTokenInCookie(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
  ): NextResponse {
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: accessToken ? config.JWT_ACCESS_EXPIRES : 0,
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: refreshToken ? config.JWT_REFRESH_EXPIRES : 0,
    });

    return response;
  }
}

// Singleton Instance
class AuthServiceSingleton {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthServiceSingleton.instance) {
      AuthServiceSingleton.instance = new AuthService();
    }
    return AuthServiceSingleton.instance;
  }
}

const authService = AuthServiceSingleton.getInstance();
export default authService;
