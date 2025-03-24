import {
  BadRequestResponse,
  ConflictResponse,
  ErrorResponse,
} from "@backend/utils/exceptions";
import { NextResponse } from "next/server";
import { UserValidation } from "@backend/dtos/users.dto";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const parseData = UserValidation.POST.safeParse(body);
    if (!parseData.success) {
      throw new BadRequestResponse(parseData.error.errors[0].message);
    }
    const { name, email, password, confirmPassword, role } = parseData.data;

    if (password !== confirmPassword) {
      throw new BadRequestResponse(
        "Password and confirm password must be the same"
      );
    }

    const userCount = await prisma.user.count({ where: { email } });
    if (userCount > 0) {
      throw new ConflictResponse("Email already exists");
    }

    const userWithHashedPassword = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      isActive: true,
    };

    const user = await prisma.user.create({
      data: userWithHashedPassword,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({ message: "User created", data: { user } });
  } catch (error) {
    return (error as ErrorResponse).generate();
  }
}
