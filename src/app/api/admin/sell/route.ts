import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const { inquiryId, status, actualPrice } = body;
    if (!inquiryId) {
      return NextResponse.json(
        { error: "inquiryId required" },
        { status: 400 }
      );
    }

    const existing = await prisma.sellInquiry.findUnique({
      where: { inquiryId: String(inquiryId).toUpperCase() },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: { status?: string; actualPrice?: number | null } = {};
    if (status) data.status = String(status);

    if (actualPrice !== undefined) {
      if (actualPrice === null || actualPrice === "") {
        data.actualPrice = null;
      } else {
        const n = Number(actualPrice);
        if (!Number.isFinite(n) || n < 0) {
          return NextResponse.json(
            { error: "Invalid actual price" },
            { status: 400 }
          );
        }
        data.actualPrice = n;
      }
    }

    // When moving to VISITED/PURCHASED without an actual yet, keep estimate as hint only.
    if (
      data.status &&
      (data.status === "VISITED" || data.status === "PURCHASED") &&
      data.actualPrice === undefined &&
      existing.actualPrice == null
    ) {
      // leave actualPrice null until filled
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.sellInquiry.update({
      where: { inquiryId: String(inquiryId).toUpperCase() },
      data,
    });

    return NextResponse.json({ inquiry: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
