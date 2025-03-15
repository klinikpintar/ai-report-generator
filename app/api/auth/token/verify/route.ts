import { NextResponse } from "next/server";
import { extractToken } from "@/app/utils/authUtils";
import authService from "@/app/services/authService";
import { ErrorResponse } from "@/app/utils/exceptions";

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
