import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email cannot be empty" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});
