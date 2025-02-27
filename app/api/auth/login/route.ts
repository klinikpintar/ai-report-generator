import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "../../dtos/auth.dto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken";
import config from "../../../config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    if (!user.isActive)
      return NextResponse.json({ message: "User not active" }, { status: 400 });

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    const response = NextResponse.json({
      data: { access_token: accessToken },
      message: "Login successful",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: config.JWT_REFRESH_EXPIRES,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
