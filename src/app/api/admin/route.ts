import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateRequest,
  requireAdmin,
  unauthorized,
  withAdminSession,
} from "@/lib/auth";
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
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  try {
    // Core dashboard data first — parallel, no heavy catalog seeding on login.
    // Each query is isolated so a missing Neon column cannot brick login.
    const [
      repairs,
      sells,
      whatsapp,
      store,
      gallery,
      contacts,
      reviews,
    ] = await Promise.all([
      prisma.repairRequest
        .findMany({
          orderBy: { updatedAt: "desc" },
          include: { statusLogs: { orderBy: { createdAt: "desc" }, take: 5 } },
        })
        .catch((err) => {
          console.error("admin repairs load failed", err);
          return [];
        }),
      prisma.sellInquiry
        .findMany({
          orderBy: { createdAt: "desc" },
        })
        .catch((err) => {
          console.error("admin sells load failed", err);
          return [];
        }),
      prisma.whatsAppLog
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 30,
        })
        .catch((err) => {
          console.error("admin whatsapp load failed", err);
          return [];
        }),
      getStoreSettings().catch((err) => {
        console.error("admin store load failed", err);
        throw err;
      }),
      prisma.galleryItem
        .findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        })
        .catch((err) => {
          console.error("admin gallery load failed", err);
          return [];
        }),
      prisma.contactInquiry
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        })
        .catch((err) => {
          console.error("admin contacts load failed", err);
          return [];
        }),
      prisma.customerReview
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        })
        .catch((err) => {
          console.error("admin reviews load failed", err);
          return [];
        }),
    ]);

    // Secondary tabs — still parallel, but never block on full catalog seed.
    const { listScenarios } = await import("@/lib/troubleshooting");
    const { listContent } = await import("@/lib/site-content");
    const { listAllParts } = await import("@/lib/parts");

    const [scenarios, content, parts] = await Promise.all([
      listScenarios().catch(() => []),
      listContent().catch(() => []),
      listAllParts().catch(() => []),
    ]);

    let staff: unknown[] = [];
    let technicians: { id: string; name: string }[] = [];
    try {
      technicians = await prisma.storeStaff.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
    } catch {
      technicians = [];
    }
    if (auth.session.role === "admin") {
      try {
        staff = await prisma.storeStaff.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            staffCode: true,
            name: true,
            active: true,
            allowedTabs: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch {
        staff = [];
      }
    }

    return withAdminSession(
      req,
      NextResponse.json({
        repairs,
        sells,
        whatsapp,
        store,
        scenarios,
        gallery,
        contacts,
        reviews,
        content,
        parts,
        staff,
        technicians,
        session: auth.session,
      }),
      auth.session
    );
  } catch (err) {
    console.error("GET /api/admin failed", err);
    return NextResponse.json(
      {
        error:
          "Admin data load failed. If this is production, push the latest Prisma schema to Neon (db:push:prod), then retry.",
      },
      { status: 500 }
    );
  }
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
