import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { getStoreSettings, saveStoreSettings } from "@/lib/store";
import { revalidatePublicSite } from "@/lib/revalidate-public";

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
      heroHeadline: body.heroHeadline,
      heroSubtext: body.heroSubtext,
      heroBadge: body.heroBadge,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      trustIntro: body.trustIntro,
      privacyBlurb: body.privacyBlurb,
      warrantyDays: body.warrantyDays,
      doorstepMinutes: body.doorstepMinutes,
      priceLockDays: body.priceLockDays,
      doorstepFee: body.doorstepFee,
      requestValidDays: body.requestValidDays,
      ctaPrimaryLabel: body.ctaPrimaryLabel,
      ctaPrimaryHref: body.ctaPrimaryHref,
      ctaSecondaryLabel: body.ctaSecondaryLabel,
      ctaSecondaryHref: body.ctaSecondaryHref,
    });

    revalidatePublicSite("store");
    return NextResponse.json({ store, message: "Site settings updated." });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save settings." },
      { status: 500 }
    );
  }
}
