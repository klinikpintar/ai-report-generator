import { NextResponse } from "next/server";
import authService from "@backend/services/authService";
import { BadRequestResponse, ErrorResponse } from "@backend/utils/exceptions";
import { LoginSchemaDto } from "@/app/(backend)/api/dtos/auth.dto";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const parseData = LoginSchemaDto.safeParse(body);
    if (!parseData.success) {
      throw new BadRequestResponse(parseData.error.errors[0].message);
    }
    const { email, password } = parseData.data;

    const { accessToken, refreshToken } = await authService.login(
      email,
      password
    );
    const response = NextResponse.json({
      message: "Login successful",
      data: { access_token: accessToken },
    });
    return authService.putRefreshTokenInCookie(response, refreshToken);
  } catch (error) {
    return (error as ErrorResponse).generate();
  }
}
