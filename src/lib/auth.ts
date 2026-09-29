import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminLoginLimited, recordFailedAdminLogin, resetAdminLoginLimit } from "./admin-rate-limit";
import {
  applySessionCookie,
  readSession,
  type SessionInfo,
} from "./admin-session";
import { prisma } from "./db";
import { parseAllowedTabs } from "./staff-tabs";

function bootstrapPassword() {
  return process.env.ADMIN_BOOTSTRAP_PASSWORD || "fixsure-admin";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const next = scryptSync(password, salt, 64);
    const prev = Buffer.from(hash, "hex");
    if (prev.length !== next.length) return false;
    return timingSafeEqual(prev, next);
  } catch {
    return false;
  }
}

let seedPromise: Promise<void> | null = null;

/** Ensure a DB-backed admin password exists (no .env dependency). */
export async function ensureAdminPasswordSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const row = await prisma.adminSettings.findUnique({
        where: { id: "default" },
      });
      if (row?.passwordHash) return;
      const passwordHash = hashPassword(bootstrapPassword());
      await prisma.adminSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          passwordHash,
        },
        update: { passwordHash },
      });
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  try {
    await ensureAdminPasswordSeeded();
    const row = await prisma.adminSettings.findUnique({
      where: { id: "default" },
    });
    if (row?.passwordHash) {
      return verifyPassword(password, row.passwordHash);
    }
  } catch {
    return false;
  }

  return false;
}

export async function verifyStaffLogin(
  staffCode: string,
  password: string
): Promise<{ id: string; name: string; allowedTabs: string } | null> {
  const code = String(staffCode || "").trim();
  if (!/^\d{6}$/.test(code) || !password) return null;
  try {
    const row = await prisma.storeStaff.findUnique({ where: { staffCode: code } });
    if (!row || !row.active) return null;
    if (!verifyPassword(password, row.passwordHash)) return null;
    return { id: row.id, name: row.name, allowedTabs: row.allowedTabs };
  } catch {
    return null;
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }

  if (currentPassword === newPassword) {
    return { ok: false, error: "New password must be different." };
  }

  const passwordHash = hashPassword(newPassword);
  await prisma.adminSettings.upsert({
    where: { id: "default" },
    create: { id: "default", passwordHash },
    update: { passwordHash },
  });

  return { ok: true };
}

export type AuthResult =
  | { ok: true; session: SessionInfo }
  | { ok: false };

export async function authenticateRequest(
  req: NextRequest
): Promise<AuthResult> {
  const existing = readSession(req);
  if (existing) {
    if (existing.role === "technician" && existing.staffId) {
      try {
        const row = await prisma.storeStaff.findUnique({
          where: { id: existing.staffId },
          select: { name: true, active: true, allowedTabs: true },
        });
        if (!row || !row.active) return { ok: false };
        return {
          ok: true,
          session: {
            role: "technician",
            staffId: existing.staffId,
            staffName: row.name,
            allowedTabs: parseAllowedTabs(row.allowedTabs),
          },
        };
      } catch {
        return { ok: false };
      }
    }
    return { ok: true, session: existing };
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (adminLoginLimited(ip)) return { ok: false };

  const staffCode = req.headers.get("x-staff-code") || "";
  const staffPassword = req.headers.get("x-staff-password") || "";
  if (staffCode || staffPassword) {
    const staff = await verifyStaffLogin(staffCode, staffPassword);
    if (!staff) {
      recordFailedAdminLogin(ip);
      return { ok: false };
    }
    resetAdminLoginLimit(ip);
    return {
      ok: true,
      session: {
        role: "technician",
        staffId: staff.id,
        staffName: staff.name,
        allowedTabs: parseAllowedTabs(staff.allowedTabs),
      },
    };
  }

  const password = req.headers.get("x-admin-password") || "";
  const ok = await verifyAdminPassword(password);
  if (!ok) {
    recordFailedAdminLogin(ip);
    return { ok: false };
  }
  resetAdminLoginLimit(ip);
  return { ok: true, session: { role: "admin" } };
}

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const result = await authenticateRequest(req);
  return result.ok;
}

/** Owner admin only (not store technicians). */
export async function requireOwnerAdmin(req: NextRequest): Promise<boolean> {
  const result = await authenticateRequest(req);
  return result.ok && result.session.role === "admin";
}

/** Attach session cookie when this request authenticated via headers (not cookie yet). */
export function withAdminSession(
  req: NextRequest,
  res: NextResponse,
  session?: SessionInfo
) {
  if (!readSession(req) && session) {
    applySessionCookie(res, session);
  } else if (!readSession(req) && req.headers.get("x-admin-password")) {
    applySessionCookie(res, { role: "admin" });
  }
  return res;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function generateStaffCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateStaffPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
