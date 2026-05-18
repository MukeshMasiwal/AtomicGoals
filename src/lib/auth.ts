import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { Role, SessionUser } from "@/types";

const SESSION_COOKIE = "goaltrack_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  approvalStatus: "Pending Approval" | "Approved" | "Rejected";
  onboardingCompleted?: boolean;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    approvalStatus: user.approvalStatus,
    onboardingCompleted: user.onboardingCompleted,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sub = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const role = payload.role;
    const department = payload.department;
    const approvalStatus = payload.approvalStatus;
    const onboardingCompleted = payload.onboardingCompleted;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof name !== "string" ||
      (role !== "employee" && role !== "manager" && role !== "admin")
    ) {
      return null;
    }

    return {
      sub: typeof sub === "string" ? sub : "",
      email,
      name,
      role,
      department: typeof department === "string" ? department : "",
      approvalStatus: (approvalStatus as "Pending Approval" | "Approved" | "Rejected") || "Pending Approval",
      onboardingCompleted: typeof onboardingCompleted === "boolean" ? onboardingCompleted : false,
    };
  } catch {
    return null;
  }
}

export function sessionPayloadToUser(payload: SessionPayload): SessionUser {
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    department: payload.department,
    approvalStatus: payload.approvalStatus || "Pending Approval",
    onboardingCompleted: payload.onboardingCompleted || false,
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload ? sessionPayloadToUser(payload) : null;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionFromCookies();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
