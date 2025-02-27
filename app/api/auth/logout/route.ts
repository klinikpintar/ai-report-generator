import { NextResponse } from "next/server";
import { verifyToken } from "../../utils/authUtils";
import config from "../../../config";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token || !verifyToken(token, config.JWT_ACCESS_SECRET)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
