import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";

/** Bootstrap password used only when AdminSettings has never been created. */
export const DEFAULT_ADMIN_PASSWORD = "fixsure-admin";

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
      const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
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
  const header = req.headers.get("x-admin-password");
  const urlPass = req.nextUrl.searchParams.get("key");
  const password = header || urlPass || "";
  return verifyAdminPassword(password);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
