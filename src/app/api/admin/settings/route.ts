import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { getStoreSettings, saveStoreSettings } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();
  const store = await getStoreSettings();
  return NextResponse.json({ store });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    if (!body.address?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Address and phone are required." },
        { status: 400 }
      );
    }

    const store = await saveStoreSettings({
      name: body.name,
      address: body.address,
      phone: body.phone,
      hours: body.hours,
      mapsUrl: body.mapsUrl,
    });

    return NextResponse.json({ store, message: "Store details updated." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
