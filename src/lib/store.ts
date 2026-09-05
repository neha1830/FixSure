import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "./db";

export type StoreInfo = {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
};

const ENV_DEFAULTS: StoreInfo = {
  name: process.env.STORE_NAME || "FixSure",
  address:
    process.env.STORE_ADDRESS ||
    "42 MG Road, Indiranagar, Bengaluru 560038",
  phone: process.env.STORE_PHONE || "+91 98765 43210",
  hours: process.env.STORE_HOURS || "Mon–Sat 10:00 AM – 8:00 PM",
  mapsUrl:
    process.env.STORE_MAPS_URL ||
    "https://maps.google.com/?q=Indiranagar+Bengaluru",
};

/** @deprecated Prefer getStoreSettings() so admin edits apply site-wide */
export const store = ENV_DEFAULTS;

export async function getStoreSettings(): Promise<StoreInfo> {
  noStore();
  try {
    const row = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return { ...ENV_DEFAULTS };
    return {
      name: row.name,
      address: row.address,
      phone: row.phone,
      hours: row.hours,
      mapsUrl: row.mapsUrl || ENV_DEFAULTS.mapsUrl,
    };
  } catch {
    return { ...ENV_DEFAULTS };
  }
}

export async function saveStoreSettings(
  data: Partial<StoreInfo>
): Promise<StoreInfo> {
  const current = await getStoreSettings();
  const next: StoreInfo = {
    name: data.name?.trim() || current.name,
    address: data.address?.trim() || current.address,
    phone: data.phone?.trim() || current.phone,
    hours: data.hours?.trim() || current.hours,
    mapsUrl: data.mapsUrl?.trim() || current.mapsUrl,
  };

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...next },
    update: next,
  });

  return next;
}

export const REPAIR_STATUSES = [
  "REQUESTED",
  "RECEIVED",
  "DIAGNOSING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const STATUS_LABELS: Record<RepairStatus, string> = {
  REQUESTED: "Request received",
  RECEIVED: "Phone submitted for repair",
  DIAGNOSING: "Diagnosis in progress",
  IN_PROGRESS: "Repair in progress",
  READY: "Ready for pickup",
  COMPLETED: "Repair completed",
  CANCELLED: "Cancelled",
};

/** Only these statuses trigger WhatsApp to real customers (Utility templates). */
export const WHATSAPP_NOTIFY_STATUSES: RepairStatus[] = [
  "RECEIVED",
  "READY",
];

export function shouldSendRepairWhatsApp(status: string): boolean {
  return WHATSAPP_NOTIFY_STATUSES.includes(status as RepairStatus);
}

export function statusWhatsAppMessage(
  opts: {
    customerName: string;
    trackingId: string;
    brand: string;
    model: string;
    status: RepairStatus;
    amount?: number | null;
  },
  storeInfo: StoreInfo = ENV_DEFAULTS
): string {
  const device = `${opts.brand} ${opts.model}`;
  const amountLine =
    opts.amount != null
      ? `\nAmount: ₹${opts.amount.toLocaleString("en-IN")}`
      : "";

  const messages: Record<RepairStatus, string> = {
    REQUESTED: `Hi ${opts.customerName}, your repair request for ${device} is confirmed (ID: ${opts.trackingId}). Visit ${storeInfo.name} at ${storeInfo.address}. Call ${storeInfo.phone}.`,
    RECEIVED: `Hi ${opts.customerName}, your ${device} has been submitted for repair at ${storeInfo.name}. Tracking ID: ${opts.trackingId}. We'll keep you updated here.`,
    DIAGNOSING: `Hi ${opts.customerName}, we're diagnosing your ${device} (ID: ${opts.trackingId}). We'll share an update shortly.`,
    IN_PROGRESS: `Hi ${opts.customerName}, repair on your ${device} is now in progress (ID: ${opts.trackingId}).${amountLine}`,
    READY: `Hi ${opts.customerName}, great news — your ${device} is ready for pickup! Tracking ID: ${opts.trackingId}.${amountLine}\nStore: ${storeInfo.address}\nHours: ${storeInfo.hours}`,
    COMPLETED: `Hi ${opts.customerName}, your ${device} repair is complete and delivered. Thank you for choosing ${storeInfo.name}! ID: ${opts.trackingId}.${amountLine}`,
    CANCELLED: `Hi ${opts.customerName}, your repair request for ${device} (ID: ${opts.trackingId}) has been cancelled. Contact us at ${storeInfo.phone} if you need help.`,
  };

  return messages[opts.status];
}

/** Variables for Twilio Content Template — map to {{1}}…{{6}} in Meta template */
export function repairWhatsAppTemplateVars(
  opts: {
    customerName: string;
    trackingId: string;
    brand: string;
    model: string;
    status: RepairStatus;
    amount?: number | null;
  },
  storeInfo: StoreInfo = ENV_DEFAULTS
): Record<string, string> {
  return {
    "1": opts.customerName,
    "2": `${opts.brand} ${opts.model}`,
    "3": opts.trackingId,
    "4": STATUS_LABELS[opts.status],
    "5":
      opts.amount != null
        ? `₹${opts.amount.toLocaleString("en-IN")}`
        : "Pending",
    "6": `${storeInfo.name}, ${storeInfo.address}, ${storeInfo.phone}`,
  };
}

export function sellWhatsAppTemplateVars(opts: {
  customerName: string;
  brand: string;
  model: string;
  storage: string;
  estimatedPrice: number;
  inquiryId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
}): Record<string, string> {
  return {
    "1": opts.customerName,
    "2": `${opts.brand} ${opts.model} (${opts.storage})`,
    "3": `₹${opts.estimatedPrice.toLocaleString("en-IN")}`,
    "4": opts.inquiryId,
    "5": `${opts.storeName}, ${opts.storeAddress}, ${opts.storePhone}`,
  };
}

