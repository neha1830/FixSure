import { NextResponse } from "next/server";
import { getPublishedParts } from "@/lib/parts";
import { PART_DEVICE_CATEGORIES } from "@/lib/parts-constants";

export async function GET() {
  const parts = await getPublishedParts();
  return NextResponse.json({
    parts,
    categories: PART_DEVICE_CATEGORIES,
  });
}
