export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginRequestInput {
  email?: string;
  username?: string;
  password: string;
}

export interface RfidLoginInput {
  rfidTag: string;
}
