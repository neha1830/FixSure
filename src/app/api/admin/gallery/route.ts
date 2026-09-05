import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/cache-tags";

async function saveUpload(file: File | null, prefix: string) {
  if (!file || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const name = `${prefix}-${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/gallery/${name}`;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const device = String(form.get("device") || "").trim();
    const repairType = String(form.get("repairType") || "").trim();
    const caption = String(form.get("caption") || "").trim();
    const consentGiven = form.get("consentGiven") === "true";
    const published = form.get("published") !== "false";
    const beforeUrlField = String(form.get("beforeUrl") || "").trim();
    const afterUrlField = String(form.get("afterUrl") || "").trim();

    if (!title || !device) {
      return NextResponse.json(
        { error: "Title and device are required." },
        { status: 400 }
      );
    }
    if (!consentGiven) {
      return NextResponse.json(
        {
          error:
            "Customer consent is required before publishing before/after photos.",
        },
        { status: 400 }
      );
    }

    const beforeUpload = await saveUpload(
      form.get("before") as File | null,
      "before"
    );
    const afterUpload = await saveUpload(
      form.get("after") as File | null,
      "after"
    );

    const beforeUrl = beforeUpload || beforeUrlField;
    const afterUrl = afterUpload || afterUrlField;

    if (!beforeUrl || !afterUrl) {
      return NextResponse.json(
        { error: "Provide before and after images (upload or URL)." },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.galleryItem.aggregate({
      _max: { sortOrder: true },
    });

    const item = await prisma.galleryItem.create({
      data: {
        title,
        device,
        repairType: repairType || null,
        caption: caption || null,
        beforeUrl,
        afterUrl,
        consentGiven: true,
        published,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    revalidatePublicSite("gallery");
    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save gallery item." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        published:
          body.published !== undefined ? Boolean(body.published) : undefined,
        title: body.title?.trim() || undefined,
        caption: body.caption !== undefined ? body.caption : undefined,
      },
    });

    revalidatePublicSite("gallery");
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePublicSite("gallery");
  return NextResponse.json({ ok: true });
}
