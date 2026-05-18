import { z } from "zod";

export const syncAppUserAccessSchema = z.object({
  categoryIds: z.array(z.string().uuid()),
  accessUntil: z.coerce.date().nullable(),
  enabled: z.boolean(),
  employeeActive: z.boolean(),
  nfcCode: z.string().trim().min(4).nullable(),
  nfcActive: z.boolean(),
});

export const validateBadgeSchema = z.object({
  rfidTag: z.string().min(4),
});

export const createAppLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().min(3),
  documentId: z.string().uuid().optional().nullable(),
  device: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
});
