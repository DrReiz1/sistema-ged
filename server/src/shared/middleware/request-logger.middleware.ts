import type { NextFunction, Request, Response } from "express";

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on("finish", () => {
    if (!req.path.startsWith("/api")) {
      return;
    }

    const elapsed = Date.now() - startedAt;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${elapsed}ms`);
  });

  next();
}
