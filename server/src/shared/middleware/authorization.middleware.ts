import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../types/auth.types";

export function authorizeRoles(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
}

export function authorizePermissions(requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.auth?.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
}
