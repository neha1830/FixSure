import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { ensurePartsSeeded, listAllParts } from "@/lib/parts";
import { PART_DEVICE_CATEGORIES } from "@/lib/parts-constants";
import { revalidatePublicSite } from "@/lib/revalidate-public";

async function savePartImage(file: File | null) {
  if (!file || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const name = `part-${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "parts");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/parts/${name}`;
}

async function parsePartPayload(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const imageFile = form.get("image") as File | null;
    const uploaded = await savePartImage(imageFile);
    const imageUrlField = String(form.get("imageUrl") || "").trim();
    return {
      id: String(form.get("id") || "").trim() || undefined,
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim(),
      deviceCategory: String(form.get("deviceCategory") || "phone"),
      brand: String(form.get("brand") || "").trim(),
      sku: String(form.get("sku") || "").trim(),
      quality: String(form.get("quality") || "COPY"),
      compatibility: String(form.get("compatibility") || "").trim(),
      price: Number(form.get("price")),
      imageUrl: uploaded || imageUrlField || null,
      clearImage: form.get("clearImage") === "true",
      inStock: form.get("inStock") !== "false",
      published: form.get("published") !== "false",
      sortOrder: Number(form.get("sortOrder")) || 0,
      imageUploaded: Boolean(uploaded),
    };
  }

  const body = await req.json();
  return {
    id: body.id ? String(body.id) : undefined,
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    deviceCategory: String(body.deviceCategory || "phone"),
    brand: String(body.brand || "").trim(),
    sku: String(body.sku || "").trim(),
    quality: String(body.quality || "COPY"),
    compatibility: String(body.compatibility || "").trim(),
    price: Number(body.price),
    imageUrl: body.imageUrl?.trim() || null,
    clearImage: false,
    inStock: body.inStock !== false,
    published: body.published !== false,
    sortOrder: Number(body.sortOrder) || 0,
    imageUploaded: false,
  };
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  await ensurePartsSeeded();
  const parts = await listAllParts();
  return NextResponse.json({
    parts,
    categories: PART_DEVICE_CATEGORIES,
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await parsePartPayload(req);
    if (!body.title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (Number.isNaN(body.price) || body.price < 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 });
    }
    const allowed = PART_DEVICE_CATEGORIES.some(
      (c) => c.key === body.deviceCategory
    );
    if (!allowed) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const part = await prisma.partItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        deviceCategory: body.deviceCategory,
        brand: body.brand || null,
        sku: body.sku || null,
        quality: body.quality,
        compatibility: body.compatibility || null,
        price: body.price,
        imageUrl: body.imageUrl,
        inStock: body.inStock,
        published: body.published,
        sortOrder: body.sortOrder,
      },
    });
    revalidatePublicSite("parts");
    return NextResponse.json({ part });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create part" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const body = await parsePartPayload(req);
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (!body.title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (Number.isNaN(body.price) || body.price < 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {
      title: body.title,
      description: body.description || null,
      deviceCategory: body.deviceCategory,
      brand: body.brand || null,
      sku: body.sku || null,
      quality: body.quality,
      compatibility: body.compatibility || null,
      price: body.price,
      inStock: body.inStock,
      published: body.published,
      sortOrder: body.sortOrder,
    };

    if (body.imageUploaded) {
      data.imageUrl = body.imageUrl;
    } else if (body.clearImage) {
      data.imageUrl = null;
    } else if (body.imageUrl !== null && body.imageUrl !== undefined) {
      data.imageUrl = body.imageUrl || null;
    }

    const part = await prisma.partItem.update({
      where: { id: body.id },
      data,
    });
    revalidatePublicSite("parts");
    return NextResponse.json({ part });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await prisma.partItem.delete({ where: { id } });
    revalidatePublicSite("parts");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
