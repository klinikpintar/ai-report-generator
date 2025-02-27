import { NextResponse } from "next/server";
import {
  verifyToken,
  getUserById,
  extractRefreshToken,
} from "../../../utils/authUtils";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateToken";
import config from "../../../../config";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("Cookie");
    const refreshToken = extractRefreshToken(cookie!);

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token" },
        { status: 403 }
      );
    }

    const decoded = verifyToken(refreshToken, config.JWT_REFRESH_SECRET);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 }
      );
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    const response = NextResponse.json({
      data: { access_token: newAccessToken },
      message: "Token refreshed",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: config.JWT_REFRESH_EXPIRES,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
