import { z } from "zod";

export const createLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().min(3),
  documentId: z.string().uuid().nullable(),
  revisionId: z.string().uuid().nullable(),
  timestamp: z.coerce.date(),
  ipAddress: z.string().nullable(),
  device: z.string().nullable(),
});

export const createRuntimeLogSchema = z.object({
  action: z.string().min(3),
  documentId: z.string().uuid().nullable().optional(),
  revisionId: z.string().uuid().nullable().optional(),
  timestamp: z.coerce.date().optional(),
});
