import { NextResponse } from "next/server";
import { estimateRepairCharge } from "@/lib/pricing-server";
import { getEstimateValidUntil } from "@/lib/pricing";
import { getPricingContext } from "@/lib/site-content";
import { getStoreSettings } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand, issueCategory, deviceType = "phone" } = body;

    if (!brand || !issueCategory) {
      return NextResponse.json(
        { error: "Brand and issue type are required." },
        { status: 400 }
      );
    }

    const [range, ctx, store] = await Promise.all([
      estimateRepairCharge({
        brand,
        issueCategory,
        deviceType,
        serviceMode: "STORE",
      }),
      getPricingContext(),
      getStoreSettings(),
    ]);
    const estimateValidUntil = getEstimateValidUntil(
      new Date(),
      ctx.priceLockDays
    );

    return NextResponse.json({
      estimatedChargeMin: range.min,
      estimatedChargeMax: range.max,
      /** @deprecated use estimatedChargeMin */
      estimatedCharge: range.min,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: ctx.priceLockDays,
      warrantyDays: store.warrantyDays,
      requestValidDays: store.requestValidDays,
      currency: "INR",
      rangeNote:
        "Lower end = copy/compatible parts (all-in). Higher end = original parts (all-in). Includes technician labour.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not calculate estimate." },
      { status: 500 }
    );
  }
}
