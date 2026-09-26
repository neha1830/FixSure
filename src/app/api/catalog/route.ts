import { NextResponse } from "next/server";
import { getPublishedCatalog } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getPublishedCatalog();
  return NextResponse.json({ categories });
}
