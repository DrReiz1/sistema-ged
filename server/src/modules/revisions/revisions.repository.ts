import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { revisionsTable } from "../../shared/database/schema";

class RevisionRepository {
  async listByDocumentId(documentId: string) {
    return memoryDb.revisions
      .filter((revision) => revision.documentId === documentId)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  }

  async create(input: {
    documentId: string;
    revisionNumber: string;
    fileUrl: string;
    fileType: string;
    uploadedBy: string;
    originalFileName: string;
    storageDiskPath: string | null;
  }) {
    const revision = {
      id: nextMemoryId(),
      ...input,
      createdAt: new Date(),
    };

    if (db) {
      await db.insert(revisionsTable).values(revision);
    }

    memoryDb.revisions.push(revision);
    return revision;
  }
}

export const revisionRepository = new RevisionRepository();
