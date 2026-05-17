import { AppError } from "../../shared/errors/app-error";
import { buildStoragePath } from "../../shared/utils/storage-path";
import { generateRevisionNumber } from "../../shared/utils/revision";
import { documentRepository } from "../documents/documents.repository";
import { categoryRepository } from "../categories/categories.repository";
import { revisionRepository } from "./revisions.repository";
import { logRepository } from "../logs/logs.repository";
import { supabase, supabaseStorageBucket } from "../../shared/database/supabase";
import { saveDocumentFile } from "../../shared/utils/local-document-storage";
import type { CreateRevisionInput } from "./revisions.types";

class RevisionService {
  async create(input: CreateRevisionInput) {
    const document = await documentRepository.findById(input.documentId);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    const category = await categoryRepository.findById(document.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const existingRevisions = await revisionRepository.listByDocumentId(document.id);
    const revisionNumber = generateRevisionNumber(existingRevisions.length + 1);
    const fileUrl = buildStoragePath(category.prefix, document.code, revisionNumber, input.fileExtension);
    let storageDiskPath: string | null = null;

    if (supabase) {
      const { error } = await supabase.storage
        .from(supabaseStorageBucket)
        .upload(fileUrl, input.fileBuffer, {
          contentType: input.fileExtension === "pdf" ? "application/pdf" : "application/octet-stream",
          upsert: false,
        });

      if (error) {
        throw new AppError("Failed to upload file to Supabase", 502, error.message);
      }
    } else {
      storageDiskPath = await saveDocumentFile(fileUrl, input.fileBuffer);
    }

    const revision = await revisionRepository.create({
      documentId: document.id,
      revisionNumber,
      fileUrl,
      fileType: input.fileExtension,
      uploadedBy: input.actorUserId,
      originalFileName: input.fileName,
      storageDiskPath,
    });

    await documentRepository.updateCurrentRevision(document.id, revision.id);

    await logRepository.create({
      userId: input.actorUserId,
      action: "publicacao_revisao",
      documentId: document.id,
      revisionId: revision.id,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    return revision;
  }
}

export const revisionService = new RevisionService();
