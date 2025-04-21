import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function POST(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const token = extractToken(cookie, "access_token");
    await authService.logout(token);
    const response = NextResponse.json({ message: "Logged out" });
    return authService.putTokenInCookie(response, "", "");
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
