import { BadRequestResponse, ErrorResponse } from "@backend/utils/exceptions";
import { NextResponse } from "next/server";
import { UserValidation } from "@backend/dtos/users.dto";
import usersService from "@backend/services/usersService";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parseQuery = UserValidation.DELETE.safeParse(params);
    if (!parseQuery.success) {
      throw new BadRequestResponse(parseQuery.error.errors[0].message);
    }
    const { id } = parseQuery.data;
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
