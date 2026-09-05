import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status required" },
        { status: 400 }
      );
    }

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: { status: String(status) },
    });

    return NextResponse.json({ contact: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update contact inquiry" },
      { status: 500 }
    );
  }
}
