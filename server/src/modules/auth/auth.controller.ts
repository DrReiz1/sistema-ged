import type { Request, Response } from "express";
import { authService } from "./auth.service";

class AuthController {
  async login(req: Request, res: Response) {
    const response = await authService.login(req.body, {
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });

    res.status(200).json(response);
  }

  async loginWithRfid(req: Request, res: Response) {
    const response = await authService.loginWithRfid(req.body, {
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });

    res.status(200).json(response);
  }

  async me(req: Request, res: Response) {
    if (!req.auth) {
      res.status(200).json(null);
      return;
    }

    res.status(200).json({
      id: req.auth.userId,
      username: req.auth.email ?? "",
      role: req.auth.role,
      permissions: req.auth.permissions,
    });
  }

  async logout(req: Request, res: Response) {
    const response = await authService.logout({
      userId: req.auth!.userId,
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });
    res.status(200).json(response);
  }
}

export const authController = new AuthController();
