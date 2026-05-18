import type { UserRole } from "../../shared/types/auth.types";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  operatorId: string;
  rfidTag?: string;
  sector: string;
  active?: boolean;
}
