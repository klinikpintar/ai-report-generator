import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";
import { apiResponseDuration } from "@backend/utils/metrics";

const route = "/api/auth/token/verify";
export async function GET(req: Request) {
  const method = "GET";
  const endTimer = apiResponseDuration.startTimer({ route, method });

  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const token = extractToken(cookie, "access_token");
    const user = await authService.verify(token);
    endTimer({ route, method });
    return NextResponse.json({
      message: "Token verified",
      data: {user},
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    endTimer({ route, method });
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
