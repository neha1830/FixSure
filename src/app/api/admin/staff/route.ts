import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateStaffCode,
  generateStaffPassword,
  hashPassword,
  requireOwnerAdmin,
  unauthorized,
  withAdminSession,
  authenticateRequest,
} from "@/lib/auth";
import { serializeAllowedTabs } from "@/lib/staff-tabs";
import { suggestUniqueName } from "@/lib/contact-validation";

async function uniqueStaffCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = generateStaffCode();
    const exists = await prisma.storeStaff.findUnique({
      where: { staffCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate staff code");
}

const staffSelect = {
  id: true,
  staffCode: true,
  name: true,
  active: true,
  allowedTabs: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(req: NextRequest) {
  if (!(await requireOwnerAdmin(req))) return unauthorized();
  const staff = await prisma.storeStaff.findMany({
    orderBy: { createdAt: "desc" },
    select: staffSelect,
  });
  const auth = await authenticateRequest(req);
  return withAdminSession(
    req,
    NextResponse.json({ staff }),
    auth.ok ? auth.session : undefined
  );
}

export async function POST(req: NextRequest) {
  if (!(await requireOwnerAdmin(req))) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const existing = await prisma.storeStaff.findMany({
    select: { name: true },
  });
  const suggestion = suggestUniqueName(
    name,
    existing.map((r) => r.name)
  );
  if (suggestion.toLowerCase() !== name.toLowerCase()) {
    return NextResponse.json(
      {
        error: `“${name}” is already used. Try “${suggestion}”.`,
        suggestion,
      },
      { status: 409 }
    );
  }

  const staffCode = await uniqueStaffCode();
  const plainPassword = generateStaffPassword();
  const allowedTabs = serializeAllowedTabs(
    Array.isArray(body.allowedTabs) ? body.allowedTabs.map(String) : []
  );

  try {
    const row = await prisma.storeStaff.create({
      data: {
        name: suggestion,
        staffCode,
        passwordHash: hashPassword(plainPassword),
        active: true,
        allowedTabs,
      },
      select: staffSelect,
    });

    const auth = await authenticateRequest(req);
    return withAdminSession(
      req,
      NextResponse.json({
        staff: row,
        credentials: {
          staffCode: row.staffCode,
          password: plainPassword,
          name: row.name,
        },
      }),
      auth.ok ? auth.session : undefined
    );
  } catch (err) {
    console.error("POST /api/admin/staff failed", err);
    return NextResponse.json(
      {
        error:
          "Could not create technician. Restart the local server (npm run dev) and try again.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireOwnerAdmin(req))) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const data: {
    name?: string;
    active?: boolean;
    passwordHash?: string;
    allowedTabs?: string;
  } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    const nextName = body.name.trim().replace(/\s+/g, " ");
    const others = await prisma.storeStaff.findMany({
      where: { NOT: { id } },
      select: { name: true },
    });
    const suggestion = suggestUniqueName(
      nextName,
      others.map((r) => r.name)
    );
    if (suggestion.toLowerCase() !== nextName.toLowerCase()) {
      return NextResponse.json(
        {
          error: `“${nextName}” is already used. Try “${suggestion}”.`,
          suggestion,
        },
        { status: 409 }
      );
    }
    data.name = nextName;
  }
  if (typeof body.active === "boolean") {
    data.active = body.active;
  }
  if (Array.isArray(body.allowedTabs)) {
    data.allowedTabs = serializeAllowedTabs(body.allowedTabs.map(String));
  }

  let plainPassword: string | undefined;
  if (body.resetPassword === true) {
    plainPassword = generateStaffPassword();
    data.passwordHash = hashPassword(plainPassword);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const row = await prisma.storeStaff.update({
    where: { id },
    data,
    select: staffSelect,
  });

  const auth = await authenticateRequest(req);
  return withAdminSession(
    req,
    NextResponse.json({
      staff: row,
      credentials: plainPassword
        ? {
            staffCode: row.staffCode,
            password: plainPassword,
            name: row.name,
          }
        : undefined,
    }),
    auth.ok ? auth.session : undefined
  );
}
