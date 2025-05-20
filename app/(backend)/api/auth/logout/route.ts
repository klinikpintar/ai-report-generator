import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = "/api/auth/logout";
export async function POST(req: Request) {
  const method = "POST";

  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const token = extractToken(cookie, "access_token");
    await authService.logout(token);
    const response = NextResponse.json({ message: "Logged out" });
    endTimer({ route, method });
    return authService.putTokenInCookie(response, "", "");
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    endTimer({ route, method });
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
