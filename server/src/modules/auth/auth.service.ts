import jwt from "jsonwebtoken";
import { AppError } from "../../shared/errors/app-error";
import { comparePassword } from "../../shared/utils/crypto";
import { getPermissionsByRole } from "../../shared/utils/role-permissions";
import { logRepository } from "../logs/logs.repository";
import { groupRepository } from "../groups/groups.repository";
import type { LoginInput, LoginRequestInput, RfidLoginInput } from "./auth.types";
import { authRepository } from "./auth.repository";

class AuthService {
  async login(input: LoginRequestInput, meta: { ipAddress?: string; device?: string }) {
    const email = input.email ?? input.username;
    if (!email) {
      throw new AppError("Invalid credentials", 401);
    }

    const normalizedInput: LoginInput = {
      email,
      password: input.password,
    };

    const user = await authRepository.findUserByEmail(normalizedInput.email);
    if (!user || !user.active) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatches = await comparePassword(normalizedInput.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    const groupPermissions = await groupRepository.getUserGroupPermissions(user.id);
    const permissions = getPermissionsByRole(user.role);
    const secret = process.env.JWT_SECRET ?? "docstation-local-secret";

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions,
      },
      secret,
      { expiresIn: "8h" },
    );

    await logRepository.create({
      userId: user.id,
      action: "login",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        groups: groupPermissions,
      },
    };
  }

  async loginWithRfid(input: RfidLoginInput, meta: { ipAddress?: string; device?: string }) {
    const user = await authRepository.findUserByRfidTag(input.rfidTag);
    if (!user || !user.active) {
      throw new AppError("RFID not recognized", 401);
    }

    const permissions = getPermissionsByRole(user.role);
    const groups = await groupRepository.getUserGroupPermissions(user.id);
    const secret = process.env.JWT_SECRET ?? "docstation-local-secret";

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions,
      },
      secret,
      { expiresIn: "8h" },
    );

    await logRepository.create({
      userId: user.id,
      action: "login_rfid",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        groups,
      },
    };
  }

  async logout(meta: {
    userId: string;
    ipAddress?: string;
    device?: string;
  }) {
    await logRepository.create({
      userId: meta.userId,
      action: "logout",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: meta.ipAddress ?? null,
      device: meta.device ?? null,
    });

    return { success: true };
  }
}

export const authService = new AuthService();
