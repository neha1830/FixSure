import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import {
  ensureScenariosSeeded,
  listScenarios,
} from "@/lib/troubleshooting";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  const scenarios = await listScenarios();
  return NextResponse.json({ scenarios });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    await ensureScenariosSeeded();
    const body = await req.json();
    const label = String(body.label || "").trim();
    if (!label) {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }

    let key = String(body.key || slugify(label)).trim().toLowerCase();
    if (!key) key = `scenario-${Date.now()}`;

    const existing = await prisma.troubleshootScenario.findUnique({
      where: { key },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A scenario with this key already exists." },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.troubleshootScenario.aggregate({
      _max: { sortOrder: true },
    });

    const steps: { title: string; detail: string }[] = Array.isArray(body.steps)
      ? body.steps.filter(
          (s: { title?: string; detail?: string }) =>
            s?.title?.trim() && s?.detail?.trim()
        )
      : [];

    const scenario = await prisma.troubleshootScenario.create({
      data: {
        key,
        label,
        description: body.description?.trim() || null,
        active: body.active !== false,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        steps: {
          create: steps.map(
            (s: { title: string; detail: string }, i: number) => ({
              title: s.title.trim(),
              detail: s.detail.trim(),
              sortOrder: i,
            })
          ),
        },
      },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ scenario });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create scenario." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const label = String(body.label || "").trim();
    if (!label) {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }

    const steps: { title: string; detail: string }[] = Array.isArray(body.steps)
      ? body.steps.filter(
          (s: { title?: string; detail?: string }) =>
            s?.title?.trim() && s?.detail?.trim()
        )
      : [];

    await prisma.troubleshootStepItem.deleteMany({ where: { scenarioId: id } });

    const scenario = await prisma.troubleshootScenario.update({
      where: { id },
      data: {
        label,
        description: body.description?.trim() || null,
        active: body.active !== false,
        sortOrder:
          typeof body.sortOrder === "number" ? body.sortOrder : undefined,
        steps: {
          create: steps.map((s, i) => ({
            title: s.title.trim(),
            detail: s.detail.trim(),
            sortOrder: i,
          })),
        },
      },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ scenario });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update scenario." }, { status: 500 });
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

    await prisma.troubleshootScenario.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete scenario." }, { status: 500 });
  }
}
