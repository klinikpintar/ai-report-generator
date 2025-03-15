import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function POST(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  try {
    const token = extractToken(authorization);
    await authService.logout(token);
    const response = NextResponse.json({ message: "Logged out" });
    return authService.putRefreshTokenInCookie(response, "");
  } catch (error) {
    return (error as ErrorResponse).generate();
  }
}
