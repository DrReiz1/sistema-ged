import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buffer.toString("hex")}.${salt}`;
}

export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  const [hash, salt] = storedHash.split(".");
  const hashedBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuffer, suppliedBuffer);
}
