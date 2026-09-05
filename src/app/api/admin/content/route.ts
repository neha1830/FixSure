import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import {
  CONTENT_TYPES,
  ensureContentSeeded,
  listContent,
} from "@/lib/site-content";
import { revalidatePublicSite } from "@/lib/revalidate-public";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  await ensureContentSeeded();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const items = await listContent(
    type && CONTENT_TYPES.includes(type as (typeof CONTENT_TYPES)[number])
      ? (type as (typeof CONTENT_TYPES)[number])
      : undefined
  );
  return NextResponse.json({ items, types: CONTENT_TYPES });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await req.json();
    const type = String(body.type || "");
    if (!CONTENT_TYPES.includes(type as (typeof CONTENT_TYPES)[number])) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    const item = await prisma.contentItem.create({
      data: {
        type,
        key: body.key?.trim() || null,
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        body: body.body?.trim() || null,
        meta: body.meta?.trim() || null,
        sortOrder: Number(body.sortOrder) || 0,
        active: body.active !== false,
      },
    });
    revalidatePublicSite("content");
    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const item = await prisma.contentItem.update({
      where: { id: body.id },
      data: {
        ...(body.type != null ? { type: String(body.type) } : {}),
        ...(body.key !== undefined
          ? { key: body.key?.trim() || null }
          : {}),
        ...(body.title != null ? { title: String(body.title).trim() } : {}),
        ...(body.subtitle !== undefined
          ? { subtitle: body.subtitle?.trim() || null }
          : {}),
        ...(body.body !== undefined
          ? { body: body.body?.trim() || null }
          : {}),
        ...(body.meta !== undefined
          ? { meta: body.meta?.trim() || null }
          : {}),
        ...(body.sortOrder !== undefined
          ? { sortOrder: Number(body.sortOrder) || 0 }
          : {}),
        ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
      },
    });
    revalidatePublicSite("content");
    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await prisma.contentItem.delete({ where: { id } });
    revalidatePublicSite("content");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
