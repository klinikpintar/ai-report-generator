import { NextResponse } from "next/server";
import authService from "@/app/services/authService";
import { BadRequestResponse, ErrorResponse } from "@/app/utils/exceptions";
import { LoginSchemaDto } from "../../dtos/auth.dto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
