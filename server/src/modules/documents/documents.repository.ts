import { eq } from "drizzle-orm";
import { db } from "../../shared/database/client";
import { memoryDb, nextMemoryId } from "../../shared/database/memory";
import { documentsTable } from "../../shared/database/schema";
import type { DocumentRecord } from "../../shared/database/memory";

class DocumentRepository {
  async list() {
    return memoryDb.documents;
  }

  async findById(id: string) {
    return memoryDb.documents.find((document) => document.id === id) ?? null;
  }

  async create(data: Omit<DocumentRecord, "id" | "createdAt">) {
    const document = {
      id: nextMemoryId(),
      ...data,
      createdAt: new Date(),
    };

    if (db) {
      await db.insert(documentsTable).values(document);
    }

    memoryDb.documents.push(document);
    return document;
  }

  async updateCurrentRevision(documentId: string, revisionId: string) {
    const document = memoryDb.documents.find((item) => item.id === documentId);
    if (!document) {
      return null;
    }

    document.currentRevisionId = revisionId;

    if (db) {
      await db.update(documentsTable)
        .set({ currentRevisionId: revisionId })
        .where(eq(documentsTable.id, documentId));
    }

    return document;
  }

  async findLastCodeByPrefix(prefix: string) {
    const matchingCodes = memoryDb.documents
      .map((document) => document.code)
      .filter((code) => code.startsWith(`${prefix.toUpperCase()}-`))
      .sort();

    return matchingCodes.at(-1) ?? null;
  }

  async delete(id: string) {
    const index = memoryDb.documents.findIndex((document) => document.id === id);
    if (index === -1) {
      return null;
    }

    const [removed] = memoryDb.documents.splice(index, 1);

    if (db) {
      await db.delete(documentsTable).where(eq(documentsTable.id, id));
    }

    return removed;
  }
}

export const documentRepository = new DocumentRepository();
