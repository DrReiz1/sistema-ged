import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().email().optional(),
  password: z.string().min(6),
}).refine((data) => Boolean(data.email || data.username), {
  message: "Email or username is required",
  path: ["email"],
});

export const rfidLoginSchema = z.object({
  rfidTag: z.string().min(4),
});
