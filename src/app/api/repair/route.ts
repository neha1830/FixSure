import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import {
  estimateRepairCharge,
  getEstimateValidUntil,
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
      deviceType,
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

    const device = deviceType || "phone";
    const estimatedCharge = await estimateRepairCharge({
      brand,
      issueCategory,
      deviceType: device,
      serviceMode: "STORE",
    });
    const store = await getStoreSettings();
    const estimateValidUntil = getEstimateValidUntil(
      new Date(),
      store.priceLockDays
    );
    const visitBy = new Date();
    visitBy.setDate(visitBy.getDate() + store.requestValidDays);
    visitBy.setHours(23, 59, 59, 999);
    const tid = `FS-${trackingId()}`;

    await prisma.repairRequest.create({
      data: {
        trackingId: tid,
        customerName,
        phoneNumber,
        email: email || null,
        deviceType: device,
        serviceMode: "STORE",
        serviceAddress: null,
        preferredDate: null,
        preferredTime: null,
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
            message: `Online repair request submitted. Bring device within ${store.requestValidDays} days or request becomes void.`,
            amount: estimatedCharge,
            whatsappSent: false,
          },
        },
      },
    });

    return NextResponse.json({
      trackingId: tid,
      phoneNumber,
      estimatedCharge,
      estimateValidUntil: estimateValidUntil.toISOString(),
      priceLockDays: store.priceLockDays,
      requestValidDays: store.requestValidDays,
      visitBy: visitBy.toISOString(),
      serviceMode: "STORE",
      store,
      message: `Request saved. Bring your phone to the store within ${store.requestValidDays} days — after that this request becomes null and void. Track anytime with your mobile number.`,
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

  const store = await getStoreSettings();
  const cutoffMs = store.requestValidDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const repairs = [];
  for (const r of candidates.filter(
    (row) => last10Digits(row.phoneNumber) === digits
  )) {
    if (
      r.status === "REQUESTED" &&
      now - new Date(r.createdAt).getTime() > cutoffMs
    ) {
      const updated = await prisma.repairRequest.update({
        where: { id: r.id },
        data: { status: "CANCELLED" },
        include: { statusLogs: { orderBy: { createdAt: "asc" } } },
      });
      await prisma.statusLog.create({
        data: {
          repairRequestId: r.id,
          status: "CANCELLED",
          message: `Request void — device not submitted within ${store.requestValidDays} days.`,
          whatsappSent: false,
        },
      });
      repairs.push({
        ...updated,
        voided: true,
        statusLogs: [
          ...updated.statusLogs,
          {
            id: "void",
            status: "CANCELLED",
            message: `Request void — device not submitted within ${store.requestValidDays} days.`,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    } else {
      const visitBy = new Date(r.createdAt);
      visitBy.setDate(visitBy.getDate() + store.requestValidDays);
      visitBy.setHours(23, 59, 59, 999);
      repairs.push({
        ...r,
        visitBy: visitBy.toISOString(),
        requestValidDays: store.requestValidDays,
      });
    }
  }

  if (repairs.length === 0) {
    return NextResponse.json(
      { error: "No repair found for this mobile number." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    repairs,
    store,
    priceLockDays: store.priceLockDays,
    requestValidDays: store.requestValidDays,
  });
}
