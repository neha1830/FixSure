import { NextResponse } from "next/server";
import {
  CONTENT_TYPES,
  ensureContentSeeded,
  listContent,
  type ContentType,
} from "@/lib/site-content";
import { getStoreSettings } from "@/lib/store";

export async function GET(req: Request) {
  try {
    await ensureContentSeeded();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const store = await getStoreSettings();

    if (type && CONTENT_TYPES.includes(type as ContentType)) {
      const items = await listContent(type as ContentType, {
        activeOnly: true,
      });
      return NextResponse.json({ items, store });
    }

    const all = await listContent(undefined, { activeOnly: true });
    const byType: Record<string, typeof all> = {};
    for (const t of CONTENT_TYPES) byType[t] = [];
    for (const item of all) {
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type].push(item);
    }
    return NextResponse.json({ byType, store });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load content" },
      { status: 500 }
    );
  }
}
