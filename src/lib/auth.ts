import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";

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

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: "default" },
    });
    if (row?.passwordHash) {
      return verifyPassword(password, row.passwordHash);
    }
  } catch {
    // DB may not be ready; fall through to env
  }

  const envPass = process.env.ADMIN_PASSWORD || "fixsure-admin";
  return password === envPass;
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
