import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = process.env.JWT_SECRET || process.env.SESSION_SECRET || "itsol-dev-secret";
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function verifyPassword(password: string, hash: string) {
  const candidate = Buffer.from(hashPassword(password));
  const expected = Buffer.from(hash);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function signValue(value: string) {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "itsol-dev-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}
