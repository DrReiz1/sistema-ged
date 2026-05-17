import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(2),
  color: z.string().min(4),
  description: z.string().optional(),
});
