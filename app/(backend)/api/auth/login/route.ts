import { NextResponse } from "next/server";
import authService from "@backend/services/authService";
import { BadRequestResponse, ErrorResponse } from "@backend/utils/exceptions";
import { LoginSchemaDto } from "@backend/dtos/auth.dto";

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
    return authService.putTokenInCookie(response, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
