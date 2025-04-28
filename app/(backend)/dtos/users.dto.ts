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

  static readonly GET = z.object({
    page: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? "1"))
      .refine((val) => val > 0, { message: "Page must be greater than 0" }),

    limit: z
      .string()
      .optional()
      .transform((val) => parseInt(val ?? "10"))
      .refine((val) => val > 0, { message: "Limit must be greater than 0" }),

    role: z
      .string()
      .optional()
      .transform((val) => val?.toUpperCase())
      .refine((val) => !val || ["BUSINESS_ANALYST", "ADMIN"].includes(val), {
        message: "Role must be either BUSINESS_ANALYST or ADMIN",
      }) as z.ZodType<"BUSINESS_ANALYST" | "ADMIN" | undefined>,
  });

  static readonly DELETE = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }),
  });

  static readonly PATCH = z.object({
    id: z.string().uuid({ message: "Invalid user ID format" }).optional(),

    email: z
      .string()
      .email({ message: "Invalid email format" })
      .min(1, { message: "Email cannot be empty" })
      .optional(),

    name: z.string().min(1, { message: "Name cannot be empty" }).optional(),

    role: z
      .enum(["BUSINESS_ANALYST", "ADMIN"])
      .transform((val) => val.toUpperCase() as "BUSINESS_ANALYST" | "ADMIN")
      .optional(),

    isActive: z.boolean().optional(),
  });
}
