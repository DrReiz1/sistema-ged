import type { UserRole } from "../../shared/types/auth.types";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rfidTag?: string;
  sector: string;
  active?: boolean;
}
