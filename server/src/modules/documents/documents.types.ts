import type { DocumentStatus } from "../../shared/types/common.types";

export interface CreateDocumentInput {
  title: string;
  description?: string;
  categoryId: string;
  groupId: string;
  status?: DocumentStatus;
  tags?: string[];
}

export interface ListDocumentsQuery {
  search?: string;
  groupId?: string;
  categoryId?: string;
  tagId?: string;
}
