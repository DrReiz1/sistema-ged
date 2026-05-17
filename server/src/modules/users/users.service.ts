import { AppError } from "../../shared/errors/app-error";
import { hashPassword } from "../../shared/utils/crypto";
import { logRepository } from "../logs/logs.repository";
import { groupRepository } from "../groups/groups.repository";
import { userRepository } from "./users.repository";
import type { CreateUserInput } from "./users.types";

class UserService {
  async list() {
    const users = await userRepository.list();
    return Promise.all(
      users.map(async ({ passwordHash: _passwordHash, ...user }) => ({
        ...user,
        groups: await groupRepository.getUserGroupPermissions(user.id),
      })),
    );
  }

  async create(input: CreateUserInput, actorUserId: string) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("User already exists", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({ ...input, passwordHash });

    await logRepository.create({
      userId: actorUserId,
      action: "criacao_usuario",
      documentId: null,
      revisionId: null,
      timestamp: new Date(),
      ipAddress: null,
      device: null,
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const userService = new UserService();
