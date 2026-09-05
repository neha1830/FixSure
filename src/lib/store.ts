import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import {
  REPAIR_STATUSES,
  STATUS_LABELS,
  WHATSAPP_NOTIFY_STATUSES,
  shouldSendRepairWhatsApp,
  type RepairStatus,
} from "./store-constants";

export {
  REPAIR_STATUSES,
  STATUS_LABELS,
  WHATSAPP_NOTIFY_STATUSES,
  shouldSendRepairWhatsApp,
  type RepairStatus,
};

export type StoreInfo = {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
  heroHeadline: string;
  heroSubtext: string;
  heroBadge: string;
  seoTitle: string;
  seoDescription: string;
  trustIntro: string;
  privacyBlurb: string;
  warrantyDays: number;
  doorstepMinutes: number;
  priceLockDays: number;
  doorstepFee: number;
  requestValidDays: number;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

const ENV_DEFAULTS: StoreInfo = {
  name: process.env.STORE_NAME || "PhoneRepairO",
  address:
    process.env.STORE_ADDRESS ||
    "42 MG Road, Indiranagar, Bengaluru 560038",
  phone: process.env.STORE_PHONE || "+91 98765 43210",
  hours: process.env.STORE_HOURS || "Mon–Sat 10:00 AM – 8:00 PM",
  mapsUrl:
    process.env.STORE_MAPS_URL ||
    "https://maps.google.com/?q=Indiranagar+Bengaluru",
  heroHeadline: "Trusted device repair — with every step visible.",
  heroSubtext:
    "Check price in seconds, book a store visit, track live updates, or sell with a fair estimate.",
  heroBadge: "Store visits · 90-day warranty · live track",
  seoTitle: "PhoneRepairO — Trusted device repair & buyback",
  seoDescription:
    "Check price, book a repair, track every stage, or get a fair sell estimate.",
  trustIntro:
    "PhoneRepairO is built so customers never wonder what happens behind the counter.",
  privacyBlurb:
    "We never access photos without permission. No sign-out or factory reset required.",
  warrantyDays: 90,
  doorstepMinutes: 90,
  priceLockDays: 7,
  doorstepFee: 299,
  requestValidDays: 3,
  ctaPrimaryLabel: "Check price",
  ctaPrimaryHref: "/price",
  ctaSecondaryLabel: "Book repair",
  ctaSecondaryHref: "/repair",
};

/** @deprecated Prefer getStoreSettings() so admin edits apply site-wide */
export const store = ENV_DEFAULTS;

function mapRow(row: {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string | null;
  heroHeadline?: string | null;
  heroSubtext?: string | null;
  heroBadge?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  trustIntro?: string | null;
  privacyBlurb?: string | null;
  warrantyDays?: number | null;
  doorstepMinutes?: number | null;
  priceLockDays?: number | null;
  doorstepFee?: number | null;
  requestValidDays?: number | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
}): StoreInfo {
  return {
    name: row.name,
    address: row.address,
    phone: row.phone,
    hours: row.hours,
    mapsUrl: row.mapsUrl || ENV_DEFAULTS.mapsUrl,
    heroHeadline: row.heroHeadline || ENV_DEFAULTS.heroHeadline,
    heroSubtext: row.heroSubtext || ENV_DEFAULTS.heroSubtext,
    heroBadge: row.heroBadge || ENV_DEFAULTS.heroBadge,
    seoTitle: row.seoTitle || ENV_DEFAULTS.seoTitle,
    seoDescription: row.seoDescription || ENV_DEFAULTS.seoDescription,
    trustIntro: row.trustIntro || ENV_DEFAULTS.trustIntro,
    privacyBlurb: row.privacyBlurb || ENV_DEFAULTS.privacyBlurb,
    warrantyDays: row.warrantyDays ?? ENV_DEFAULTS.warrantyDays,
    doorstepMinutes: row.doorstepMinutes ?? ENV_DEFAULTS.doorstepMinutes,
    priceLockDays: row.priceLockDays ?? ENV_DEFAULTS.priceLockDays,
    doorstepFee: row.doorstepFee ?? ENV_DEFAULTS.doorstepFee,
    requestValidDays:
      row.requestValidDays ?? ENV_DEFAULTS.requestValidDays,
    ctaPrimaryLabel: row.ctaPrimaryLabel || ENV_DEFAULTS.ctaPrimaryLabel,
    ctaPrimaryHref: row.ctaPrimaryHref || ENV_DEFAULTS.ctaPrimaryHref,
    ctaSecondaryLabel:
      row.ctaSecondaryLabel || ENV_DEFAULTS.ctaSecondaryLabel,
    ctaSecondaryHref: row.ctaSecondaryHref || ENV_DEFAULTS.ctaSecondaryHref,
  };
}

async function loadStoreSettings(): Promise<StoreInfo> {
  try {
    const row = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return { ...ENV_DEFAULTS };
    return mapRow(row);
  } catch {
    return { ...ENV_DEFAULTS };
  }
}

const getCachedStoreSettings = unstable_cache(
  loadStoreSettings,
  ["store-settings"],
  { tags: [CACHE_TAGS.store], revalidate: 300 }
);

/** Public store settings — request-deduped and cached ~5 minutes. */
export const getStoreSettings = cache(() => getCachedStoreSettings());

export async function saveStoreSettings(
  data: Partial<StoreInfo>
): Promise<StoreInfo> {
  const current = await loadStoreSettings();
  const next: StoreInfo = {
    name: data.name?.trim() || current.name,
    address: data.address?.trim() || current.address,
    phone: data.phone?.trim() || current.phone,
    hours: data.hours?.trim() || current.hours,
    mapsUrl: data.mapsUrl?.trim() || current.mapsUrl,
    heroHeadline: data.heroHeadline?.trim() || current.heroHeadline,
    heroSubtext: data.heroSubtext?.trim() || current.heroSubtext,
    heroBadge: data.heroBadge?.trim() || current.heroBadge,
    seoTitle: data.seoTitle?.trim() || current.seoTitle,
    seoDescription: data.seoDescription?.trim() || current.seoDescription,
    trustIntro: data.trustIntro?.trim() || current.trustIntro,
    privacyBlurb: data.privacyBlurb?.trim() || current.privacyBlurb,
    warrantyDays:
      data.warrantyDays != null ? Number(data.warrantyDays) : current.warrantyDays,
    doorstepMinutes:
      data.doorstepMinutes != null
        ? Number(data.doorstepMinutes)
        : current.doorstepMinutes,
    priceLockDays:
      data.priceLockDays != null
        ? Number(data.priceLockDays)
        : current.priceLockDays,
    doorstepFee:
      data.doorstepFee != null ? Number(data.doorstepFee) : current.doorstepFee,
    requestValidDays:
      data.requestValidDays != null
        ? Number(data.requestValidDays)
        : current.requestValidDays,
    ctaPrimaryLabel: data.ctaPrimaryLabel?.trim() || current.ctaPrimaryLabel,
    ctaPrimaryHref: data.ctaPrimaryHref?.trim() || current.ctaPrimaryHref,
    ctaSecondaryLabel:
      data.ctaSecondaryLabel?.trim() || current.ctaSecondaryLabel,
    ctaSecondaryHref:
      data.ctaSecondaryHref?.trim() || current.ctaSecondaryHref,
  };

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...next },
    update: next,
  });

  return next;
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
  storeInfo: Pick<StoreInfo, "name" | "phone"> = ENV_DEFAULTS
): string {
  const device = `${opts.brand} ${opts.model}`;
  const amountLine =
    opts.amount != null
      ? `\nAmount: ₹${opts.amount.toLocaleString("en-IN")}`
      : "";

  const messages: Partial<Record<RepairStatus, string>> = {
    RECEIVED: `Hi ${opts.customerName}, we received your ${device} (ID: ${opts.trackingId}). Diagnosis will start soon. — ${storeInfo.name}`,
    READY: `Hi ${opts.customerName}, your ${device} (ID: ${opts.trackingId}) is ready for pickup.${amountLine}\nCall ${storeInfo.phone} — ${storeInfo.name}`,
  };

  return (
    messages[opts.status] ||
    `Hi ${opts.customerName}, update on ${device} (${opts.trackingId}): ${STATUS_LABELS[opts.status]}.${amountLine} — ${storeInfo.name}`
  );
}

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
