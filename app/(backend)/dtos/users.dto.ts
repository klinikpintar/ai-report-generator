import { z } from "zod";

export class UserValidation {
  static readonly POST = z
    .object({
      email: z
        .string()
        .email({ message: "Invalid email format" })
        .min(1, { message: "Email cannot be empty" }),

      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .refine((val) => /[a-z]/.test(val), {
          message: "Password must contain at least one lowercase letter",
        })
        .refine((val) => /[A-Z]/.test(val), {
          message: "Password must contain at least one uppercase letter",
        })
        .refine((val) => /\d/.test(val), {
          message: "Password must contain at least one number",
        })
        .refine((val) => /[^A-Za-z0-9]/.test(val), {
          message: "Password must contain at least one special character",
        }),

      confirmPassword: z
        .string()
        .min(1, { message: "Confirm password cannot be empty" }),

      name: z.string().min(1, { message: "Name cannot be empty" }),

      role: z
        .enum(["BUSINESS_ANALYST", "ADMIN"])
        .transform((val) => val.toUpperCase() as "BUSINESS_ANALYST" | "ADMIN"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Password and confirm password must match",
    });
}
