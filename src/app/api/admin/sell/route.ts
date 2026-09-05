import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const { inquiryId, status } = body;
    if (!inquiryId || !status) {
      return NextResponse.json(
        { error: "inquiryId and status required" },
        { status: 400 }
      );
    }

    const updated = await prisma.sellInquiry.update({
      where: { inquiryId: String(inquiryId).toUpperCase() },
      data: { status },
    });

    return NextResponse.json({ inquiry: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
