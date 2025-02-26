import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const EXPIRES_ACCESS = parseInt(process.env.JWT_ACCESS_EXPIRES || "3600", 10);
const EXPIRES_REFRESH = parseInt(
  process.env.JWT_REFRESH_EXPIRES || "86400",
  10
);

export async function POST(req: Request) {
  try {
    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      return NextResponse.json(
        {
          message: "Internal server error",
        },
        { status: 500 }
      );
    }

    const refreshToken = req.headers
      .get("Cookie")
      ?.split("refresh_token=")[1]
      ?.split(";")[0];

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token" },
        { status: 403 }
      );
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: EXPIRES_ACCESS }
    );

    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: EXPIRES_REFRESH,
    });

    const response = NextResponse.json({
      data: { access_token: newAccessToken },
      message: "Token refreshed",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: EXPIRES_REFRESH,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
