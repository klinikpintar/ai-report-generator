import { NextResponse } from "next/server";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";
import { extractToken } from "@backend/utils/authUtils";

export async function POST(req: Request) {
  console.log("POST /api/auth/token/refresh");
  console.log(req.headers);

  try {
    const refreshToken = extractToken("cookie", "refresh_token");
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
    return (error as ErrorResponse).generate();
  }
}
