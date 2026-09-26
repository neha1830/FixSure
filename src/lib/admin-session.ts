import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "fs_admin";
const MAX_AGE_SEC = 60 * 60 * 8;

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.DATABASE_URL ||
    "fixsure-dev-session"
  );
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export function createAdminSessionToken() {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function readAdminSession(req: NextRequest): boolean {
  const raw = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, mac] = parts;
  if (!exp || !nonce || !mac) return false;
  const payload = `${exp}.${nonce}`;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expiresAt = Number(exp);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function applyAdminSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return res;
}

export function clearAdminSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
