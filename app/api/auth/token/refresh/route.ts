import { NextResponse } from "next/server";
import { extractRefreshToken } from "../../../../utils/authUtils";
import config from "../../../../config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import authService from "@/app/services/authService";

export async function POST(req: Request) {
  const cookie = req.headers.get("Cookie") || "";

  const refreshToken = extractRefreshToken(cookie);

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 403 });
  }

  const decoded = authService.verifyToken(
    refreshToken,
    config.JWT_REFRESH_SECRET
  );
  if (!decoded) {
    return NextResponse.json(
      { message: "Invalid refresh token or expired" },
      { status: 403 }
    );
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: { userId: decoded.id },
  });

  if (
    !storedToken ||
    !(await bcrypt.compare(refreshToken, storedToken.token))
  ) {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
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

  const response = NextResponse.json({
    data: { access_token: newAccessToken },
    message: "Token refreshed",
  });

  return authService.putRefreshTokenInCookie(response, newRefreshToken);
}
