import { eq } from "drizzle-orm";
import { db } from "../../shared/database/client";
import { AppError } from "../../shared/errors/app-error";
import { buildSimplePdf } from "../../shared/utils/pdf";
import { generateDocumentCode } from "../../shared/utils/document-code";
import { deleteDocumentFile, readDocumentFile } from "../../shared/utils/local-document-storage";
import { supabase, supabaseStorageBucket } from "../../shared/database/supabase";
import { documentTagsTable, revisionsTable } from "../../shared/database/schema";
import { logRepository } from "../logs/logs.repository";
import { categoryRepository } from "../categories/categories.repository";
import { groupRepository } from "../groups/groups.repository";
import { documentRepository } from "./documents.repository";
import type { CreateDocumentInput, ListDocumentsQuery } from "./documents.types";
import { memoryDb, nextMemoryId, type DocumentRecord } from "../../shared/database/memory";

class DocumentService {
  async getForApp(id: string) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    return this.hydrateDocument(document);
  }

  async listByGroupIds(groupIds: string[]) {
    const documents = (await documentRepository.list())
      .filter((document) => groupIds.includes(document.groupId));

    return documents.map((document) => this.hydrateDocument(document));
  }

  async list(query: ListDocumentsQuery, userId: string, role: string) {
    const allowedGroupIds = role === "admin"
      ? null
      : (await groupRepository.getUserGroupPermissions(userId)).map((group) => group.id);

    let documents = await documentRepository.list();

    if (allowedGroupIds) {
      documents = documents.filter((document) => allowedGroupIds.includes(document.groupId));
    }

    if (query.groupId) {
      documents = documents.filter((document) => document.groupId === query.groupId);
    }

    if (query.categoryId) {
      documents = documents.filter((document) => document.categoryId === query.categoryId);
    }

    if (query.search) {
      const normalizedSearch = query.search.toLowerCase();
      documents = documents.filter((document) =>
        document.title.toLowerCase().includes(normalizedSearch) ||
        document.code.toLowerCase().includes(normalizedSearch) ||
        (document.description ?? "").toLowerCase().includes(normalizedSearch),
      );
    }

    if (query.tagId) {
      const taggedDocumentIds = memoryDb.documentTags
        .filter((tagLink) => tagLink.tagId === query.tagId)
        .map((tagLink) => tagLink.documentId);

      documents = documents.filter((document) => taggedDocumentIds.includes(document.id));
    }

    return documents.map((document) => this.hydrateDocument(document));
  }

  async getById(id: string, userId: string, role: string) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    if (role !== "admin") {
      const allowedGroupIds = (await groupRepository.getUserGroupPermissions(userId)).map((group) => group.id);
      if (!allowedGroupIds.includes(document.groupId)) {
        throw new AppError("Forbidden", 403);
      }
    }

    const hydratedDocument = this.hydrateDocument(document);

    await logRepository.create({
      userId,
      action: "visualizacao",
      documentId: hydratedDocument.id,
      revisionId: hydratedDocument.currentRevisionId,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return hydratedDocument;
  }

  async create(input: CreateDocumentInput, actorUserId: string) {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const groups = await groupRepository.list();
    const group = groups.find((item) => item.id === input.groupId);
    if (!group) {
      throw new AppError("Group not found", 404);
    }

    const lastCode = await documentRepository.findLastCodeByPrefix(category.prefix);
    const lastSequence = lastCode ? Number(lastCode.split("-")[1]) : 0;
    const newCode = generateDocumentCode(category.prefix, lastSequence + 1);

    const document = await documentRepository.create({
      code: newCode,
      title: input.title,
      description: input.description ?? null,
      categoryId: input.categoryId,
      groupId: input.groupId,
      currentRevisionId: null,
      status: input.status ?? "active",
    });

    for (const tagId of input.tags ?? []) {
      const tagLink = {
        id: nextMemoryId(),
        documentId: document.id,
        tagId,
      };

      if (db) {
        await db.insert(documentTagsTable).values(tagLink);
      }

      memoryDb.documentTags.push(tagLink);
    }

    await logRepository.create({
      userId: actorUserId,
      action: "upload",
      documentId: document.id,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return this.hydrateDocument(document);
  }

  async delete(id: string, actorUserId: string, role: string) {
    if (role !== "admin") {
      throw new AppError("Forbidden", 403);
    }

    const document = await documentRepository.findById(id);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    const revisions = memoryDb.revisions.filter((revision) => revision.documentId === id);
    await Promise.all(
      revisions.map(async (revision) => {
        if (revision.storageDiskPath) {
          await deleteDocumentFile(revision.fileUrl).catch(() => undefined);
          return;
        }

        if (supabase) {
          await supabase.storage.from(supabaseStorageBucket).remove([revision.fileUrl]).catch(() => undefined);
        }
      }),
    );

    await documentRepository.delete(id);
    if (db) {
      await db.delete(revisionsTable).where(eq(revisionsTable.documentId, id));
      await db.delete(documentTagsTable).where(eq(documentTagsTable.documentId, id));
    }
    memoryDb.revisions = memoryDb.revisions.filter((revision) => revision.documentId !== id);
    memoryDb.documentTags = memoryDb.documentTags.filter((link) => link.documentId !== id);

    await logRepository.create({
      userId: actorUserId,
      action: "exclusao",
      documentId: id,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return { success: true };
  }

  async registerDownload(id: string, userId: string, revisionId: string | null) {
    await logRepository.create({
      userId,
      action: "download",
      documentId: id,
      revisionId,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });
  }

  async buildDocumentFile(id: string, userId?: string, role?: string, revisionId?: string) {
    const document = userId && role
      ? await this.getById(id, userId, role)
      : this.hydrateDocument(await this.requireDocument(id));
    const revision = revisionId
      ? document.revisions.find((item) => item.id === revisionId) ?? null
      : document.currentRevision;

    if (!revision) {
      throw new AppError("Revision not found", 404);
    }

    const fileName = `${document.code}_${revision.revisionNumber}.${revision.fileType}`;

    if (revision.storageDiskPath) {
      return {
        buffer: await readDocumentFile(revision.fileUrl),
        fileName,
        fileType: revision.fileType,
      };
    }

    if (supabase) {
      const { data, error } = await supabase.storage
        .from(supabaseStorageBucket)
        .download(revision.fileUrl);

      if (error) {
        throw new AppError("Failed to download file from Supabase", 502, error.message);
      }

      return {
        buffer: Buffer.from(await data.arrayBuffer()),
        fileName,
        fileType: revision.fileType,
      };
    }

    const lines = [
      "DocStation GED Industrial",
      `Codigo: ${document.code}`,
      `Titulo: ${document.title}`,
      `Categoria: ${document.category?.name ?? "-"}`,
      `Grupo: ${document.group?.name ?? "-"}`,
      `Revisao: ${revision.revisionNumber}`,
      `Tipo: ${revision.fileType.toUpperCase()}`,
      `Arquivo: ${revision.fileUrl}`,
      `Descricao: ${document.description ?? "Sem descricao"}`,
    ];

    return {
      buffer: buildSimplePdf(lines),
      fileName,
      fileType: "pdf",
    };
  }

  private async requireDocument(id: string) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    return document;
  }

  private hydrateDocument(document: DocumentRecord) {
    const category = memoryDb.categories.find((item) => item.id === document.categoryId) ?? null;
    const group = memoryDb.groups.find((item) => item.id === document.groupId) ?? null;
    const revisions = memoryDb.revisions
      .filter((revision) => revision.documentId === document.id)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    const tagLinks = memoryDb.documentTags.filter((tagLink) => tagLink.documentId === document.id);
    const tags = tagLinks
      .map((tagLink) => memoryDb.tags.find((tag) => tag.id === tagLink.tagId))
      .filter(Boolean);
    const uploadedBy = (userId: string) => memoryDb.users.find((user) => user.id === userId)?.name ?? userId;

    return {
      ...document,
      category,
      group,
      tags,
      revisions: revisions.map((revision) => ({
        ...revision,
        uploadedByName: uploadedBy(revision.uploadedBy),
      })),
      currentRevision: revisions.find((revision) => revision.id === document.currentRevisionId)
        ? {
            ...(revisions.find((revision) => revision.id === document.currentRevisionId)!),
            uploadedByName: uploadedBy(revisions.find((revision) => revision.id === document.currentRevisionId)!.uploadedBy),
          }
        : null,
    };
  }
}

export const documentService = new DocumentService();
