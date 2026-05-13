import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

export type { SessionUser };

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "estatehub-dev-secret-change-in-production!!"
);

export const AUTH_COOKIE = "eh_token";

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT(user as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
