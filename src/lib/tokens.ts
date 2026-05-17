import crypto from "crypto";

export function generateResetToken(): { token: string; hashedToken: string } {
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Hash it before saving to DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hashedToken };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
