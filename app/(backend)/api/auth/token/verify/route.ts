import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function GET(req: Request) {
  const cookie = req.headers.get("Cookie") ?? "";
  try {
    const token = extractToken(cookie, "access_token");
    const user = await authService.verify(token);
    console.log("token", cookie);

    return NextResponse.json(
      {
        data: { user },
        message: "Token verified",
      },
      { status: 200 }
    );
  } catch (error) {
    return (error as ErrorResponse).generate();
  }
}
