import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";
import type { JwtPayloadData } from "../types/auth.types";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authorizationToken = req.headers.authorization?.replace("Bearer ", "");
  const requestUrl = new URL(req.originalUrl, "http://localhost");
  const queryToken = requestUrl.searchParams.get("token") ?? undefined;
  const token = authorizationToken ?? queryToken;

  if (!token) {
    next(new AppError("Authentication token not provided", 401));
    return;
  }

  try {
    const secret = process.env.JWT_SECRET ?? "docstation-local-secret";
    const decoded = jwt.verify(token, secret) as JwtPayloadData;
    req.auth = decoded;
    next();
  } catch {
    next(new AppError("Invalid authentication token", 401));
  }
}
