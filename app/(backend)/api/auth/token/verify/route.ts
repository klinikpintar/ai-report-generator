import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function GET(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const token = extractToken(cookie, "access_token");
    const user = await authService.verify(token);
    return NextResponse.json({
      message: "Token verified",
      data: {user},
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
