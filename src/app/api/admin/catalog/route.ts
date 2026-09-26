import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import {
  CATALOG_CATEGORY_META,
  ensureCatalogSeeded,
  listCatalogAdmin,
} from "@/lib/catalog-store";
import { revalidatePublicSite } from "@/lib/revalidate-public";

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `item-${Date.now()}`;
}

async function uniqueId(
  table: "series" | "model",
  desired: string
): Promise<string> {
  let id = desired;
  for (let i = 0; i < 8; i++) {
    const exists =
      table === "series"
        ? await prisma.catalogSeries.findUnique({ where: { id } })
        : await prisma.catalogModel.findUnique({ where: { id } });
    if (!exists) return id;
    id = `${desired}-${i + 2}`;
  }
  return `${desired}-${Date.now()}`;
}

async function saveImage(file: File | null) {
  if (!file || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const name = `device-${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "catalog");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/catalog/${name}`;
}

async function parsePayload(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const uploaded = await saveImage(form.get("image") as File | null);
    return {
      entity: String(form.get("entity") || "model"),
      id: String(form.get("id") || "").trim(),
      categoryId: String(form.get("categoryId") || "phone"),
      seriesId: String(form.get("seriesId") || "").trim(),
      label: String(form.get("label") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      details: String(form.get("details") || "").trim(),
      imageUrl: uploaded || String(form.get("imageUrl") || "").trim(),
      imageUploaded: Boolean(uploaded),
      clearImage: form.get("clearImage") === "true",
      published: form.get("published") !== "false",
      sortOrder: Number(form.get("sortOrder")) || 0,
    };
  }
  const body = await req.json();
  return {
    entity: String(body.entity || "model"),
    id: String(body.id || "").trim(),
    categoryId: String(body.categoryId || "phone"),
    seriesId: String(body.seriesId || "").trim(),
    label: String(body.label || "").trim(),
    brand: String(body.brand || "").trim(),
    details: String(body.details || "").trim(),
    imageUrl: String(body.imageUrl || "").trim(),
    imageUploaded: false,
    clearImage: false,
    published: body.published !== false,
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    await ensureCatalogSeeded();
    const series = await listCatalogAdmin();
    return NextResponse.json({
      series,
      categories: CATALOG_CATEGORY_META,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load catalog" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await parsePayload(req);
    if (!body.label) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    if (body.entity === "series") {
      const allowed = CATALOG_CATEGORY_META.some((c) => c.id === body.categoryId);
      if (!allowed) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      const id = await uniqueId("series", slugify(body.id || body.label));
      const series = await prisma.catalogSeries.create({
        data: {
          id,
          categoryId: body.categoryId,
          label: body.label,
          brand: body.brand || body.label,
          imageUrl: body.imageUrl || "/images/products/stage/iphone-16.jpg",
          published: body.published,
          sortOrder: body.sortOrder,
        },
      });
      revalidatePublicSite("catalog");
      return NextResponse.json({ series });
    }

    if (!body.seriesId) {
      return NextResponse.json({ error: "Series required" }, { status: 400 });
    }
    const parent = await prisma.catalogSeries.findUnique({
      where: { id: body.seriesId },
    });
    if (!parent) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }
    const id = await uniqueId("model", slugify(body.id || body.label));
    const model = await prisma.catalogModel.create({
      data: {
        id,
        seriesId: body.seriesId,
        label: body.label,
        details: body.details || null,
        imageUrl: body.imageUrl || parent.imageUrl,
        published: body.published,
        sortOrder: body.sortOrder,
      },
    });
    if (body.imageUploaded) {
      await prisma.catalogSeries.update({
        where: { id: parent.id },
        data: { imageUrl: parent.imageUrl || body.imageUrl },
      });
    }
    revalidatePublicSite("catalog");
    return NextResponse.json({ model });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await parsePayload(req);
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (!body.label) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    if (body.entity === "series") {
      const data: Record<string, unknown> = {
        categoryId: body.categoryId,
        label: body.label,
        brand: body.brand || body.label,
        published: body.published,
        sortOrder: body.sortOrder,
      };
      if (body.imageUploaded || body.imageUrl) data.imageUrl = body.imageUrl;
      const series = await prisma.catalogSeries.update({
        where: { id: body.id },
        data,
      });
      revalidatePublicSite("catalog");
      return NextResponse.json({ series });
    }

    const existing = await prisma.catalogModel.findUnique({
      where: { id: body.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const data: Record<string, unknown> = {
      label: body.label,
      details: body.details || null,
      published: body.published,
      sortOrder: body.sortOrder,
    };
    if (body.seriesId) data.seriesId = body.seriesId;
    if (body.imageUploaded) data.imageUrl = body.imageUrl;
    else if (body.clearImage) data.imageUrl = existing.imageUrl;
    else if (body.imageUrl) data.imageUrl = body.imageUrl;

    const model = await prisma.catalogModel.update({
      where: { id: body.id },
      data,
    });
    revalidatePublicSite("catalog");
    return NextResponse.json({ model });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const entity = url.searchParams.get("entity") || "model";
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (entity === "series") {
      await prisma.catalogSeries.delete({ where: { id } });
    } else {
      await prisma.catalogModel.delete({ where: { id } });
    }
    revalidatePublicSite("catalog");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
