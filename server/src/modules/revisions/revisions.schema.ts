import { z } from "zod";

export const revisionDocumentIdParamsSchema = z.object({
  documentId: z.string().uuid(),
});
