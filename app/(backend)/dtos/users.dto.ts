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
}
