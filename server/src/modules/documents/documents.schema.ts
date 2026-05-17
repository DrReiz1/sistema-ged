import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  groupId: z.string().uuid(),
  status: z.enum(["active", "archived", "draft"]).optional(),
  tags: z.array(z.string().uuid()).optional(),
});

export const listDocumentsQuerySchema = z.object({
  search: z.string().optional(),
  groupId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
});

export const documentIdParamsSchema = z.object({
  id: z.string().uuid(),
});
