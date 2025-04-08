import { z } from "zod";

export class UserValidation {
  static readonly POST = z.object({
    email: z
      .string()
      .email({ message: "Invalid email format" })
      .min(1, { message: "Email cannot be empty" }),
    password: z.string().min(1, { message: "Password cannot be empty" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password cannot be empty" }),
    name: z.string().min(1, { message: "Name cannot be empty" }),
    role: z.enum(["BUSINESS_ANALYST", "ADMIN"]),
  });
}
