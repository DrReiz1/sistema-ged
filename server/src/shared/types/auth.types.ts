export type UserRole = "operator" | "supervisor" | "admin";

export interface JwtPayloadData {
  userId: string;
  role: UserRole;
  permissions: string[];
  email?: string;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayloadData;
      authToken?: string;
    }
  }
}
