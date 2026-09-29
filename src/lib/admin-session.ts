import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "fs_admin";
const MAX_AGE_SEC = 60 * 60 * 8;

export type SessionRole = "admin" | "technician";

export type SessionInfo = {
  role: SessionRole;
  staffId?: string;
  staffName?: string;
  allowedTabs?: string[];
};

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

export function createSessionToken(info: SessionInfo) {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const nonce = randomBytes(12).toString("hex");
  const staffId = info.staffId || "-";
  const staffName = encodeURIComponent(info.staffName || "");
  const payload = `${exp}.${info.role}.${staffId}.${staffName}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

/** @deprecated use createSessionToken */
export function createAdminSessionToken() {
  return createSessionToken({ role: "admin" });
}

export function readSession(req: NextRequest): SessionInfo | null {
  const raw = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  // Legacy: exp.nonce.mac (3 parts) = admin
  if (parts.length === 3) {
    const [exp, nonce, mac] = parts;
    if (!exp || !nonce || !mac) return null;
    const payload = `${exp}.${nonce}`;
    const expected = sign(payload);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const expiresAt = Number(exp);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return { role: "admin" };
  }
  // Current: exp.role.staffId.staffName.nonce.mac
  if (parts.length !== 6) return null;
  const [exp, role, staffId, staffNameEnc, nonce, mac] = parts;
  if (!exp || !role || !staffId || !nonce || !mac) return null;
  const payload = `${exp}.${role}.${staffId}.${staffNameEnc}.${nonce}`;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const expiresAt = Number(exp);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  if (role !== "admin" && role !== "technician") return null;
  return {
    role,
    staffId: staffId === "-" ? undefined : staffId,
    staffName: staffNameEnc ? decodeURIComponent(staffNameEnc) : undefined,
  };
}

export function readAdminSession(req: NextRequest): boolean {
  return Boolean(readSession(req));
}

export function applySessionCookie(res: NextResponse, info: SessionInfo) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: createSessionToken(info),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return res;
}

export function applyAdminSessionCookie(res: NextResponse) {
  return applySessionCookie(res, { role: "admin" });
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
