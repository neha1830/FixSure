import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import {
  estimateSellPrice,
  getEstimateValidUntil,
} from "@/lib/pricing";
import { getStoreSettings } from "@/lib/store";
import {
  normalizePhoneDigits,
  optionalEmailValidationError,
  phoneValidationError,
} from "@/lib/contact-validation";

const inquiryId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      phoneNumber,
      email,
      brand,
      model,
      storage,
      condition,
      batteryHealth,
      hasBox,
      hasCharger,
      screenCondition,
      bodyCondition,
      notes,
    } = body;

    if (
      !customerName ||
      !phoneNumber ||
      !brand ||
      !model ||
      !storage ||
      !condition
    ) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    const phoneErr = phoneValidationError(phoneNumber);
    if (phoneErr) {
      return NextResponse.json({ error: phoneErr }, { status: 400 });
    }
    const emailErr = optionalEmailValidationError(email);
    if (emailErr) {
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }
    const normalizedPhone = normalizePhoneDigits(phoneNumber);

    const estimatedPrice = estimateSellPrice({
      brand,
      storage,
      condition,
      batteryHealth,
      hasBox,
      hasCharger,
    });
    const store = await getStoreSettings();
    const estimateValidUntil = getEstimateValidUntil(
      new Date(),
      store.priceLockDays
    );
    const iid = `SL-${inquiryId()}`;

    await prisma.sellInquiry.create({
      data: {
        inquiryId: iid,
        customerName,
        phoneNumber: normalizedPhone,
        email: email || null,
        brand,
        model,
        storage,
        condition,
        batteryHealth: batteryHealth || null,
        hasBox: Boolean(hasBox),
        hasCharger: Boolean(hasCharger),
        screenCondition: screenCondition || null,
        bodyCondition: bodyCondition || null,
        notes: notes || null,
        estimatedPrice,
        estimateValidUntil,
      },
    });

    return NextResponse.json({
      inquiryId: iid,
      estimatedPrice,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: store.priceLockDays,
      store,
      disclaimer: `This is an online estimate locked for ${store.priceLockDays} days. Final offer is confirmed after in-store inspection.`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save sell inquiry." },
      { status: 500 }
    );
  }
}
