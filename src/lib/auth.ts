import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminLoginLimited, resetAdminLoginLimit } from "./admin-rate-limit";
import {
  applyAdminSessionCookie,
  readAdminSession,
} from "./admin-session";
import { prisma } from "./db";

function bootstrapPassword() {
  return process.env.ADMIN_BOOTSTRAP_PASSWORD || "fixsure-admin";
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
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

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  if (readAdminSession(req)) return true;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (adminLoginLimited(ip)) return false;

  const password = req.headers.get("x-admin-password") || "";
  const ok = await verifyAdminPassword(password);
  if (ok) resetAdminLoginLimit(ip);
  return ok;
}

export function withAdminSession(req: NextRequest, res: NextResponse) {
  if (!readAdminSession(req) && req.headers.get("x-admin-password")) {
    applyAdminSessionCookie(res);
  }
  return res;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
