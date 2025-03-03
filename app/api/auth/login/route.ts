import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "../../dtos/auth.dto";
import authService from "@/app/services/authService";

export async function POST(req: Request) {
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

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  const accessToken = authService.generateAccessToken({
    id: user.id,
    role: user.role,
  });
  const refreshToken = await authService.generateRefreshToken({
    id: user.id,
  });

  const response = NextResponse.json({
    data: { access_token: accessToken },
    message: "Login successful",
  });

  return authService.putRefreshTokenInCookie(response, refreshToken);
}
