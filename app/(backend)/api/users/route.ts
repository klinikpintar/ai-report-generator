import { BadRequestResponse, ErrorResponse } from "@backend/utils/exceptions";
import { NextResponse } from "next/server";
import { UserValidation } from "@backend/dtos/users.dto";
import usersService from "@backend/services/usersService";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const parseData = UserValidation.POST.safeParse(body);
    if (!parseData.success) {
      throw new BadRequestResponse(parseData.error.errors[0].message);
    }

    const user = await usersService.createUser(parseData.data);
    return NextResponse.json({ message: "User created", data: { user } });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error("Unexpected error during user creation:", error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
