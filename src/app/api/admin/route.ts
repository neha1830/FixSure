import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/auth";
import {
  REPAIR_STATUSES,
  RepairStatus,
  getStoreSettings,
  statusWhatsAppMessage,
  repairWhatsAppTemplateVars,
  shouldSendRepairWhatsApp,
} from "@/lib/store";
import { sendWhatsApp, getRepairTemplateSid } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  const repairs = await prisma.repairRequest.findMany({
    orderBy: { updatedAt: "desc" },
    include: { statusLogs: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  const sells = await prisma.sellInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const whatsapp = await prisma.whatsAppLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const store = await getStoreSettings();
  const { listScenarios } = await import("@/lib/troubleshooting");
  const scenarios = await listScenarios();
  const gallery = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const contacts = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reviews = await prisma.customerReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const { listContent, ensureContentSeeded } = await import(
    "@/lib/site-content"
  );
  await ensureContentSeeded();
  const content = await listContent();

  return NextResponse.json({
    repairs,
    sells,
    whatsapp,
    store,
    scenarios,
    gallery,
    contacts,
    reviews,
    content,
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const { trackingId, status, finalAmount, adminNotes, sendMessage } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId and status required" },
        { status: 400 }
      );
    }

    if (!REPAIR_STATUSES.includes(status as RepairStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const repair = await prisma.repairRequest.findUnique({
      where: { trackingId: String(trackingId).toUpperCase() },
    });

    if (!repair) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const amount =
      finalAmount !== undefined && finalAmount !== null && finalAmount !== ""
        ? Number(finalAmount)
        : repair.finalAmount;

    const updated = await prisma.repairRequest.update({
      where: { id: repair.id },
      data: {
        status,
        finalAmount: amount ?? null,
        adminNotes:
          adminNotes !== undefined ? adminNotes : repair.adminNotes,
      },
    });

    let whatsappSent = false;
    const wantsWhatsApp =
      sendMessage !== false && shouldSendRepairWhatsApp(status);

    if (wantsWhatsApp) {
      const storeInfo = await getStoreSettings();
      const message = statusWhatsAppMessage(
        {
          customerName: repair.customerName,
          trackingId: repair.trackingId,
          brand: repair.brand,
          model: repair.model,
          status: status as RepairStatus,
          amount: amount,
        },
        storeInfo
      );

      const wa = await sendWhatsApp({
        phoneNumber: repair.phoneNumber,
        message,
        relatedType: "repair",
        relatedId: repair.id,
        contentSid: getRepairTemplateSid(),
        contentVariables: repairWhatsAppTemplateVars(
          {
            customerName: repair.customerName,
            trackingId: repair.trackingId,
            brand: repair.brand,
            model: repair.model,
            status: status as RepairStatus,
            amount: amount,
          },
          storeInfo
        ),
      });
      whatsappSent = wa.success;
    }

    await prisma.statusLog.create({
      data: {
        repairRequestId: repair.id,
        status,
        message: adminNotes || `Status updated to ${status}`,
        amount: amount ?? null,
        whatsappSent,
      },
    });

    return NextResponse.json({ repair: updated, whatsappSent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
