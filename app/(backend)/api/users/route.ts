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
    return (error as ErrorResponse).generate();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      role: searchParams.get("role") ?? undefined,
    };

    const parsed = UserValidation.GET.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestResponse(parsed.error.errors[0].message);
    }

    const { page, limit, role } = parsed.data;
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
    return (error as ErrorResponse).generate();
  }
}
