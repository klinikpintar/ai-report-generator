import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "../../dtos/auth.dto";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const EXPIRES_ACCESS = parseInt(process.env.JWT_ACCESS_EXPIRES || "3600", 10);
const EXPIRES_REFRESH = parseInt(
  process.env.JWT_REFRESH_EXPIRES || "86400",
  10
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedBody = loginSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { message: validatedBody.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validatedBody.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: "User not active" }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      return NextResponse.json(
        {
          message: "Internal server error",
        },
        { status: 500 }
      );
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_SECRET,
      {
        expiresIn: EXPIRES_ACCESS,
      }
    );

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: EXPIRES_REFRESH,
    });

    const response = NextResponse.json({
      data: { access_token: accessToken },
      message: "Login successful",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: EXPIRES_REFRESH,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
