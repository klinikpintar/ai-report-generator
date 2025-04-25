import { NextResponse } from "next/server";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";
import { extractToken } from "@backend/utils/authUtils";

export async function POST(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const refreshToken = extractToken(cookie, "refresh_token");
    const { newAccessToken, newRefreshToken } = await authService.refreshToken(
      refreshToken
    );

    const response = NextResponse.json({
      data: { access_token: newAccessToken },
      message: "Token refreshed",
    });
    return authService.putTokenInCookie(
      response,
      newAccessToken,
      newRefreshToken
    );
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
