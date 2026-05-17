import type { Request, Response } from "express";
import { userService } from "./users.service";

class UserController {
  async list(_req: Request, res: Response) {
    const users = await userService.list();
    res.status(200).json(users);
  }

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body, req.auth!.userId);
    res.status(201).json(user);
  }
}

export const userController = new UserController();
