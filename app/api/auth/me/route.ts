import { NextResponse } from "next/server";
import { extractToken } from "../../../utils/authUtils"; 
import config from "../../../config";
import authService from "../../../services/authService";
import prisma from "../../../../lib/prisma";

export async function GET(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  const token = extractToken(authorization);  

  if (!token) {
    return NextResponse.json({ message: "No access token" }, { status: 403 });
  }

  try {
    const decoded = authService.verifyToken(token, config.JWT_ACCESS_SECRET);

    if (!decoded) {
      return NextResponse.json({ message: "Invalid or expired access token" }, { status: 403 });
    }

    // retrieve user data based on id from the payload
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // if token is valid, and user is found, return user data
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}