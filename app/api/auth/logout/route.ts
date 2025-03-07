import { NextResponse } from "next/server";
import { extractToken } from "../../../utils/authUtils";
import config from "../../../config";
import prisma from "@/lib/prisma";
import authService from "@/app/services/authService";

export async function POST(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  const token = extractToken(authorization);

  if (!token || !authService.verifyToken(token, config.JWT_ACCESS_SECRET)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.refreshToken.deleteMany({ where: { token } });

  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
