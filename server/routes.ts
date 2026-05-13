import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";

const defaultUsers = [
  { username: "admin@tsea.com.br",      password: "tsea@2024", role: "administrador" },
  { username: "supervisor@tsea.com.br", password: "tsea@2024", role: "supervisor" },
  { username: "operador@tsea.com.br",   password: "tsea@2024", role: "operador" },
];

async function seedUsers() {
  for (const u of defaultUsers) {
    const existing = await storage.getUserByUsername(u.username);
    if (!existing) {
      const hashed = await hashPassword(u.password);
      await storage.createUser({ username: u.username, password: hashed, role: u.role });
      console.log(`Usuário criado: ${u.username} [${u.role}]`);
    }
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);
  await seedUsers();
  return httpServer;
}
