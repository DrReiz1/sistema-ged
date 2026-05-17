import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export const assignUserGroupPermissionSchema = z.object({
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});
