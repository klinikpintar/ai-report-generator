import { NextResponse } from "next/server";
import { extractRefreshToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function POST(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const refreshToken = extractRefreshToken(cookie);
    const { newAccessToken, newRefreshToken } = await authService.refreshToken(
      refreshToken
    );

    const response = NextResponse.json({
      data: { access_token: newAccessToken },
      message: "Token refreshed",
    });
    return authService.putTokenInCookie(response, newAccessToken, newRefreshToken);
  } catch (error) {
    return (error as ErrorResponse).generate();
  }
}
