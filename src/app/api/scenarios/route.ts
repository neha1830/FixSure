import { NextResponse } from "next/server";
import { listScenarios } from "@/lib/troubleshooting";

/** Public: active scenarios for customer forms */
export async function GET() {
  const scenarios = await listScenarios({ activeOnly: true });
  return NextResponse.json({
    categories: scenarios.map((s) => ({
      value: s.key,
      label: s.label,
      description: s.description,
    })),
  });
}
