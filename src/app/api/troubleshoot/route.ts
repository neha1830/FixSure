import { NextResponse } from "next/server";
import {
  estimateRepairCharge,
  getEstimateValidUntil,
  PRICE_LOCK_DAYS,
} from "@/lib/pricing";
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

    const estimatedCharge = estimateRepairCharge({ brand, issueCategory });
    const estimateValidUntil = getEstimateValidUntil();
    const store = await getStoreSettings();

    return NextResponse.json({
      steps,
      estimatedCharge,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: PRICE_LOCK_DAYS,
      store,
      message:
        "Try these steps first. If the issue remains, submit a repair request and visit our store.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
