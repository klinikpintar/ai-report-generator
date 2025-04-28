import {
  BadRequestResponse,
  ErrorResponse,
  UnauthenticatedResponse,
} from "@backend/utils/exceptions";
import { NextResponse } from "next/server";
import { UserValidation } from "@backend/dtos/users.dto";
import usersService from "@backend/services/usersService";
import authService from "@backend/services/authService";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userLogin = await authService.getUserLogin();
    if (!userLogin) throw new UnauthenticatedResponse("Unauthorized");

    const { id } = await context.params;

    if (userLogin.id === id)
      throw new BadRequestResponse("You cannot delete your own account");

    const parseQuery = UserValidation.DELETE.safeParse({ id });
    if (!parseQuery.success) {
      throw new BadRequestResponse(parseQuery.error.errors[0].message);
    }

    const user = await usersService.deleteUser(id);
    return NextResponse.json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error("Unexpected error during user deletion:", error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
