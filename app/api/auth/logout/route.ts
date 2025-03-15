import { NextResponse } from "next/server";
import { extractToken } from "../../../utils/authUtils";
import authService from "@/app/services/authService";
import { ErrorResponse } from "@/app/utils/exceptions";

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
