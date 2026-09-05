import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import {
  estimateRepairCharge,
  getEstimateValidUntil,
  PRICE_LOCK_DAYS,
} from "@/lib/pricing";
import { getStoreSettings } from "@/lib/store";

const trackingId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function last10Digits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

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
      batteryHealth,
      color,
      imei,
      issueCategory,
      issueDescription,
      troubleshootTried,
      privacyAck,
    } = body;

    if (
      !customerName ||
      !phoneNumber ||
      !brand ||
      !model ||
      !issueCategory ||
      !issueDescription
    ) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (!privacyAck) {
      return NextResponse.json(
        {
          error:
            "Please acknowledge the data privacy pledge before submitting.",
        },
        { status: 400 }
      );
    }

    const estimatedCharge = estimateRepairCharge({ brand, issueCategory });
    const estimateValidUntil = getEstimateValidUntil();
    const tid = `FS-${trackingId()}`;

    await prisma.repairRequest.create({
      data: {
        trackingId: tid,
        customerName,
        phoneNumber,
        email: email || null,
        brand,
        model,
        storage: storage || null,
        batteryHealth: batteryHealth || null,
        color: color || null,
        imei: imei || null,
        issueCategory,
        issueDescription,
        troubleshootTried: Boolean(troubleshootTried),
        privacyAck: true,
        estimatedCharge,
        estimateValidUntil,
        status: "REQUESTED",
        statusLogs: {
          create: {
            status: "REQUESTED",
            message: "Online repair request submitted",
            amount: estimatedCharge,
            whatsappSent: false,
          },
        },
      },
    });

    const store = await getStoreSettings();

    return NextResponse.json({
      trackingId: tid,
      phoneNumber,
      estimatedCharge,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: PRICE_LOCK_DAYS,
      store,
      message:
        "Request saved. Visit the store with your phone. Track status anytime using your mobile number.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save repair request." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "Mobile number is required." },
      { status: 400 }
    );
  }

  const digits = last10Digits(phone);
  if (digits.length < 10) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  const candidates = await prisma.repairRequest.findMany({
    where: {
      OR: [
        { phoneNumber: { endsWith: digits } },
        { phoneNumber: digits },
        { phoneNumber: `+91${digits}` },
        { phoneNumber: `91${digits}` },
      ],
    },
    include: { statusLogs: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  const repairs = candidates.filter(
    (r) => last10Digits(r.phoneNumber) === digits
  );

  if (repairs.length === 0) {
    return NextResponse.json(
      { error: "No repair found for this mobile number." },
      { status: 404 }
    );
  }

  const store = await getStoreSettings();
  return NextResponse.json({
    repairs,
    store,
    priceLockDays: PRICE_LOCK_DAYS,
  });
}
