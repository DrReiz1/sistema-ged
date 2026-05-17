import type { Request, Response } from "express";
import { groupService } from "./groups.service";

class GroupController {
  async list(_req: Request, res: Response) {
    const groups = await groupService.list();
    res.status(200).json(groups);
  }

  async create(req: Request, res: Response) {
    const group = await groupService.create(req.body, req.auth!.userId);
    res.status(201).json(group);
  }

  async assignUserPermission(req: Request, res: Response) {
    const permission = await groupService.assignUserPermission(req.body, req.auth!.userId);
    res.status(201).json(permission);
  }
}

export const groupController = new GroupController();
