import type { Request, Response } from "express";
import { documentService } from "./documents.service";

class DocumentController {
  private getContentType(fileType: string) {
    if (fileType === "pdf") {
      return "application/pdf";
    }

    if (fileType === "dwg") {
      return "image/vnd.dwg";
    }

    if (fileType === "dxf") {
      return "application/dxf";
    }

    if (fileType === "png") {
      return "image/png";
    }

    if (fileType === "jpg") {
      return "image/jpeg";
    }

    if (fileType === "webp") {
      return "image/webp";
    }

    return "application/octet-stream";
  }

  async list(req: Request, res: Response) {
    const documents = await documentService.list(req.query, req.auth!.userId, req.auth!.role);
    res.status(200).json(documents);
  }

  async getById(req: Request, res: Response) {
    const document = await documentService.getById(String(req.params.id), req.auth!.userId, req.auth!.role);
    res.status(200).json(document);
  }

  async create(req: Request, res: Response) {
    const document = await documentService.create(req.body, req.auth!.userId);
    res.status(201).json(document);
  }

  async remove(req: Request, res: Response) {
    const response = await documentService.delete(String(req.params.id), req.auth!.userId, req.auth!.role);
    res.status(200).json(response);
  }

  async preview(req: Request, res: Response) {
    const file = await documentService.buildDocumentFile(String(req.params.id), req.auth?.userId, req.auth?.role);
    res.setHeader("Content-Type", this.getContentType(file.fileType));
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    res.status(200).send(file.buffer);
  }

  async download(req: Request, res: Response) {
    const revisionId = typeof req.query.revisionId === "string" ? req.query.revisionId : undefined;
    const file = await documentService.buildDocumentFile(
      String(req.params.id),
      req.auth?.userId,
      req.auth?.role,
      revisionId,
    );
    if (req.auth) {
      await documentService.registerDownload(String(req.params.id), req.auth.userId, revisionId ?? null);
    }
    res.setHeader("Content-Type", this.getContentType(file.fileType));
    res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
    res.status(200).send(file.buffer);
  }
}

export const documentController = new DocumentController();
