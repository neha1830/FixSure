import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "id and valid status required" },
        { status: 400 }
      );
    }

    const review = await prisma.customerReview.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ review });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.customerReview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
