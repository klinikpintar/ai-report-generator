import {
  BadRequestResponse,
  ErrorResponse,
  UnauthenticatedResponse,
} from "@backend/utils/exceptions";
import { NextResponse } from "next/server";
import { UserValidation } from "@backend/dtos/users.dto";
import usersService from "@backend/services/usersService";
import authService from "@backend/services/authService";
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = "/api/users/[id]";
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const method = "DELETE";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
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
    endTimer({ route, method });
    return NextResponse.json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error("Unexpected error during user deletion:", error);
    endTimer({ route, method });
    return new ErrorResponse("Internal server error", 500).generate();
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const method = "PATCH";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    const { id } = await context.params;
    const body = await req.json();

    const parseQuery = UserValidation.PATCH.safeParse({ ...body, id });
    if (!parseQuery.success) {
      throw new BadRequestResponse(parseQuery.error.errors[0].message);
    }
    const { id: userId, ...restData } = parseQuery.data;

    const user = await usersService.updateUser(userId as string, restData);
    endTimer({ route, method });
    return NextResponse.json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error("Unexpected error during user update:", error);
    endTimer({ route, method });
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
