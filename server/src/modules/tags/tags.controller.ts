import type { Request, Response } from "express";
import { tagService } from "./tags.service";

class TagController {
  async list(_req: Request, res: Response) {
    const tags = await tagService.list();
    res.status(200).json(tags);
  }

  async create(req: Request, res: Response) {
    const tag = await tagService.create(req.body, req.auth!.userId);
    res.status(201).json(tag);
  }
}

export const tagController = new TagController();
