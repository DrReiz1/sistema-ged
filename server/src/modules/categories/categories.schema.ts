import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3),
  prefix: z.string().min(2).max(5),
  description: z.string().optional(),
});
