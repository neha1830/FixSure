import { NextResponse } from "next/server";
import { estimateRepairCharge } from "@/lib/pricing-server";
import { getEstimateValidUntil } from "@/lib/pricing";
import { getTroubleshootSteps } from "@/lib/troubleshooting";
import { getStoreSettings } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand, model, issueCategory, issueDescription } = body;

    if (!brand || !model || !issueCategory) {
      return NextResponse.json(
        { error: "Brand, model, and issue category are required." },
        { status: 400 }
      );
    }

    const steps = await getTroubleshootSteps({
      brand,
      model,
      issueCategory,
      issueDescription: issueDescription || "",
    });

    const store = await getStoreSettings();
    const range = await estimateRepairCharge({
      brand,
      issueCategory,
    });
    const estimateValidUntil = getEstimateValidUntil(
      new Date(),
      store.priceLockDays
    );

    return NextResponse.json({
      steps,
      estimatedChargeMin: range.min,
      estimatedChargeMax: range.max,
      estimatedCharge: range.min,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: store.priceLockDays,
      store,
      rangeNote:
        "Lower = copy parts (all-in). Higher = original parts (all-in).",
      message:
        "Try these steps first. If the issue remains, submit a repair request and visit our store.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
