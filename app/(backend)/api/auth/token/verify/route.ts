import { NextResponse } from "next/server";
import { extractToken } from "@backend/utils/authUtils";
import authService from "@backend/services/authService";
import { ErrorResponse } from "@backend/utils/exceptions";

export async function GET(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  try {
    const token = extractToken(authorization);
    const user = await authService.verify(token);

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
