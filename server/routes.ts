import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";

async function seedDefaultUser() {
  const existing = await storage.getUserByUsername("admin@tsea.com.br");
  if (!existing) {
    const hashed = await hashPassword("tsea@2024");
    await storage.createUser({ username: "admin@tsea.com.br", password: hashed });
    console.log("Usuário padrão criado: admin@tsea.com.br / tsea@2024");
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);
  await seedDefaultUser();
  return httpServer;
}
