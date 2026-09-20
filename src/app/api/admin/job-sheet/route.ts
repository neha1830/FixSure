import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import { estimateRepairCharge } from "@/lib/pricing-server";
import { getEstimateValidUntil } from "@/lib/pricing";
import { getStoreSettings } from "@/lib/store";
import { sendWhatsApp } from "@/lib/whatsapp";

const trackingId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function parseOptionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function normalizeChecklist(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const customerName = String(body.customerName || "").trim();
    const phoneNumber = String(body.phoneNumber || "").trim();
    const brand = String(body.brand || "").trim();
    const model = String(body.model || "").trim();
    const issueCategory = String(body.issueCategory || "other").trim();
    const issueDescription = String(body.issueDescription || "").trim();

    if (!customerName || !phoneNumber || !brand || !model || !issueDescription) {
      return NextResponse.json(
        {
          error:
            "Customer name, phone, brand, model, and problem description are required.",
        },
        { status: 400 }
      );
    }

    const deviceType = String(body.deviceType || "phone");
    let estimatedCharge = parseOptionalNumber(body.estimatedCharge);
    let estimatedChargeMax = parseOptionalNumber(body.estimatedChargeMax);

    if (estimatedCharge == null) {
      const range = await estimateRepairCharge({
        brand,
        issueCategory,
        deviceType,
        serviceMode: "STORE",
      });
      estimatedCharge = range.min;
      estimatedChargeMax = range.max;
    } else if (estimatedChargeMax == null) {
      estimatedChargeMax = estimatedCharge;
    }

    const store = await getStoreSettings();
    const tid = `FS-${trackingId()}`;
    const status = String(body.status || "RECEIVED");

    const repair = await prisma.repairRequest.create({
      data: {
        trackingId: tid,
        customerName,
        phoneNumber,
        email: body.email?.trim() || null,
        deviceType,
        serviceMode: "STORE",
        brand,
        model,
        imei: body.imei?.trim() || null,
        serialNumber: body.serialNumber?.trim() || null,
        devicePasscode: body.devicePasscode?.trim() || null,
        technicianName: body.technicianName?.trim() || null,
        dueDate: body.dueDate?.trim() || null,
        preChecklist: normalizeChecklist(body.preChecklist),
        partsUsed: body.partsUsed?.trim() || null,
        issueCategory,
        issueDescription,
        estimatedCharge,
        estimatedChargeMax,
        estimateValidUntil: getEstimateValidUntil(
          new Date(),
          store.priceLockDays
        ),
        status,
        adminNotes: body.adminNotes?.trim() || null,
        privacyAck: true,
        statusLogs: {
          create: {
            status,
            message: "Job sheet created in admin.",
            amount: estimatedCharge,
          },
        },
      },
    });

    let whatsappSent = false;
    if (body.sendWhatsApp) {
      const trackHint = `Track status with your mobile number at ${store.name}.`;
      const message = `Hi ${customerName}, job sheet ${tid} created for your ${brand} ${model}. Estimate ₹${Number(estimatedCharge).toLocaleString("en-IN")}–₹${Number(estimatedChargeMax).toLocaleString("en-IN")}. ${trackHint} — ${store.name}`;
      const wa = await sendWhatsApp({
        phoneNumber,
        message,
        relatedType: "repair",
        relatedId: repair.id,
      });
      whatsappSent = wa.success;
    }

    return NextResponse.json({ repair, whatsappSent });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create job sheet." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const trackingIdValue = String(body.trackingId || "").trim().toUpperCase();
    if (!trackingIdValue) {
      return NextResponse.json({ error: "trackingId required" }, { status: 400 });
    }

    const existing = await prisma.repairRequest.findUnique({
      where: { trackingId: trackingIdValue },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const stringFields = [
      "customerName",
      "phoneNumber",
      "email",
      "deviceType",
      "brand",
      "model",
      "imei",
      "serialNumber",
      "devicePasscode",
      "technicianName",
      "dueDate",
      "partsUsed",
      "issueCategory",
      "issueDescription",
      "adminNotes",
    ] as const;

    for (const key of stringFields) {
      if (body[key] !== undefined) {
        const v = body[key];
        data[key] =
          v === null || v === ""
            ? key === "customerName" ||
              key === "phoneNumber" ||
              key === "brand" ||
              key === "model" ||
              key === "issueCategory" ||
              key === "issueDescription"
              ? String(v || existing[key])
              : null
            : String(v).trim();
      }
    }

    if (body.preChecklist !== undefined) {
      data.preChecklist = normalizeChecklist(body.preChecklist);
    }
    if (body.estimatedCharge !== undefined) {
      data.estimatedCharge = parseOptionalNumber(body.estimatedCharge);
    }
    if (body.estimatedChargeMax !== undefined) {
      data.estimatedChargeMax = parseOptionalNumber(body.estimatedChargeMax);
    }
    if (body.finalAmount !== undefined) {
      data.finalAmount = parseOptionalNumber(body.finalAmount);
    }
    if (body.status !== undefined) {
      data.status = String(body.status);
    }

    const repair = await prisma.repairRequest.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({ repair });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update job sheet." },
      { status: 500 }
    );
  }
}
