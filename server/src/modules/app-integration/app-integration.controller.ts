import type { Request, Response } from "express";
import { appIntegrationService } from "./app-integration.service";

class AppIntegrationController {
  async listUsers(_req: Request, res: Response) {
    const users = await appIntegrationService.listUsers();
    res.status(200).json(users);
  }

  async syncUserAccess(req: Request, res: Response) {
    const access = await appIntegrationService.syncUserAccess(
      {
        ...req.body,
        userId: String(req.params.userId),
      },
      req.auth!.userId,
    );
    res.status(200).json(access);
  }

  async validateBadge(req: Request, res: Response) {
    const response = await appIntegrationService.validateBadge(req.body, {
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });
    res.status(200).json(response);
  }

  async listDocuments(req: Request, res: Response) {
    const documents = await appIntegrationService.listDocumentsForUser(String(req.params.userId));
    res.status(200).json(documents);
  }

  async createLog(req: Request, res: Response) {
    const log = await appIntegrationService.createAppLog(req.body);
    res.status(201).json({
      id: log.id,
      userId: log.userId,
      groupId: log.groupId,
      action: log.action,
      timestamp: log.timestamp,
      source: log.source,
    });
  }
}

export const appIntegrationController = new AppIntegrationController();
