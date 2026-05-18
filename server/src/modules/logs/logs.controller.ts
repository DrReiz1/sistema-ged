import type { Request, Response } from "express";
import { logService } from "./logs.service";

class LogController {
  async list(req: Request, res: Response) {
    const logs = await logService.list({
      userId: req.auth!.userId,
      role: req.auth!.role,
    });
    res.status(200).json(logs);
  }

  async create(req: Request, res: Response) {
    const log = await logService.createRuntimeLog(req.body, {
      userId: req.auth!.userId,
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });
    res.status(201).json(log);
  }
}

export const logController = new LogController();
