import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";
import { revisionService } from "./revisions.service";

class RevisionController {
  async create(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new AppError("File is required", 400);
    }

    const extension = file.originalname.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new AppError("Invalid file extension", 400);
    }

    const normalizedExtension = extension === "jpeg" ? "jpg" : extension;

    const revision = await revisionService.create({
      documentId: String(req.params.documentId),
      actorUserId: req.auth!.userId,
      fileName: file.originalname,
      fileExtension: normalizedExtension,
      fileBuffer: file.buffer,
    });

    res.status(201).json(revision);
  }
}

export const revisionController = new RevisionController();
