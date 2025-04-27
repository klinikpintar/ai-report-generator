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
    console.error(error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const parseQuery = UserValidation.GET.safeParse(params);
    if (!parseQuery.success) {
      throw new BadRequestResponse(parseQuery.error.errors[0].message);
    }

    const { page, limit, role } = parseQuery.data;
    const { users, pagination } = await usersService.getUsers({
      page,
      limit,
      role,
    });

    const { totalPages, totalItems } = pagination;

    return NextResponse.json({
      message: "Users fetched successfully",
      data: users,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    console.error(error);
    return new ErrorResponse("Internal server error", 500).generate();
  }
}
