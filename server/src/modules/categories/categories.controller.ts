import type { Request, Response } from "express";
import { categoryService } from "./categories.service";

class CategoryController {
  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    res.status(200).json(categories);
  }

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body, req.auth!.userId);
    res.status(201).json(category);
  }
}

export const categoryController = new CategoryController();
