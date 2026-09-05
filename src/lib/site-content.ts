import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import { parseMeta } from "./content-meta";

export { parseMeta };

export const CONTENT_TYPES = [
  "device",
  "service",
  "brand",
  "process",
  "why",
  "trust",
  "testimonial",
  "faq",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type ContentItemDto = {
  id: string;
  type: string;
  key: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  meta: string | null;
  sortOrder: number;
  active: boolean;
};

type SeedItem = {
  type: ContentType;
  key?: string;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: Record<string, unknown>;
  sortOrder: number;
};

const SEED: SeedItem[] = [
  { type: "device", key: "phone", title: "Mobile Phone", subtitle: "iPhone & Android repairs", meta: { multiplier: 1 }, sortOrder: 0 },
  { type: "device", key: "tablet", title: "Tablet", subtitle: "iPad & Android tablets", meta: { multiplier: 1.35 }, sortOrder: 1 },
  { type: "device", key: "macbook", title: "MacBook / Laptop", subtitle: "Screens, batteries, ports", meta: { multiplier: 2.1 }, sortOrder: 2 },
  { type: "device", key: "smartwatch", title: "Smartwatch", subtitle: "Apple Watch & more", meta: { multiplier: 1.15 }, sortOrder: 3 },

  { type: "service", key: "screen", title: "Screen / Display Replacement", subtitle: "Cracked, blank, or flickering displays", meta: { basePrice: 2499 }, sortOrder: 0 },
  { type: "service", key: "glass", title: "Broken Display Glass", subtitle: "Outer glass damage with working LCD/OLED", meta: { basePrice: 1999 }, sortOrder: 1 },
  { type: "service", key: "backglass", title: "Back Glass Replacement", subtitle: "Shattered or cracked rear glass", meta: { basePrice: 2299 }, sortOrder: 2 },
  { type: "service", key: "battery", title: "Battery Replacement", subtitle: "Drain, swelling, or sudden shutdowns", meta: { basePrice: 1499 }, sortOrder: 3 },
  { type: "service", key: "charging", title: "Charging Port Replacement", subtitle: "Loose port, slow charge, no charge", meta: { basePrice: 999 }, sortOrder: 4 },
  { type: "service", key: "camera", title: "Camera Repair", subtitle: "Blurry lens, focus, or module issues", meta: { basePrice: 1799 }, sortOrder: 5 },
  { type: "service", key: "speaker", title: "Speaker / Mic Repair", subtitle: "Crackling, low volume, or no sound", meta: { basePrice: 899 }, sortOrder: 6 },
  { type: "service", key: "software", title: "Software Issues", subtitle: "Boot loops, updates, performance", meta: { basePrice: 499 }, sortOrder: 7 },
  { type: "service", key: "water", title: "Water / Liquid Damage", subtitle: "Diagnostics and board-level care", meta: { basePrice: 2999 }, sortOrder: 8 },
  { type: "service", key: "other", title: "Other / Not sure", subtitle: "Describe the issue — we’ll guide you", meta: { basePrice: 799 }, sortOrder: 9 },

  { type: "brand", key: "apple", title: "Apple", meta: { multiplier: 1.8 }, sortOrder: 0 },
  { type: "brand", key: "samsung", title: "Samsung", meta: { multiplier: 1.25 }, sortOrder: 1 },
  { type: "brand", key: "xiaomi", title: "Xiaomi", meta: { multiplier: 0.9 }, sortOrder: 2 },
  { type: "brand", key: "vivo", title: "Vivo", meta: { multiplier: 0.85 }, sortOrder: 3 },
  { type: "brand", key: "oneplus", title: "OnePlus", meta: { multiplier: 1.15 }, sortOrder: 4 },
  { type: "brand", key: "oppo", title: "Oppo", meta: { multiplier: 0.85 }, sortOrder: 5 },
  { type: "brand", key: "google", title: "Google", meta: { multiplier: 1.35 }, sortOrder: 6 },
  { type: "brand", key: "realme", title: "Realme", meta: { multiplier: 0.8 }, sortOrder: 7 },
  { type: "brand", key: "motorola", title: "Motorola", meta: { multiplier: 0.95 }, sortOrder: 8 },
  { type: "brand", key: "iqoo", title: "iQOO", meta: { multiplier: 0.9 }, sortOrder: 9 },
  { type: "brand", key: "poco", title: "Poco", meta: { multiplier: 0.85 }, sortOrder: 10 },
  { type: "brand", key: "nothing", title: "Nothing", meta: { multiplier: 1.1 }, sortOrder: 11 },
  { type: "brand", key: "nokia", title: "Nokia", meta: { multiplier: 0.9 }, sortOrder: 12 },
  { type: "brand", key: "honor", title: "Honor", meta: { multiplier: 0.9 }, sortOrder: 13 },
  { type: "brand", key: "asus", title: "Asus", meta: { multiplier: 1 }, sortOrder: 14 },
  { type: "brand", key: "huawei", title: "Huawei", meta: { multiplier: 1.05 }, sortOrder: 15 },

  { type: "process", title: "Check price", body: "Pick your device and issue. Get a clear estimate with no hidden costs — locked for days when you book.", sortOrder: 0 },
  { type: "process", title: "Book a store visit", body: "Submit a repair request so our technicians can plan parts and time. Bring your device within the validity window shown on your request.", sortOrder: 1 },
  { type: "process", title: "Sit back & track", body: "Genuine parts where available, warranty on the job, and live status updates until you’re done.", sortOrder: 2 },

  { type: "why", title: "Genuine parts focus", body: "Quality components and professional replacements — we tell you what’s going into your device.", sortOrder: 0 },
  { type: "why", title: "Transparent pricing", body: "Online estimate with a price lock. Final amount only after diagnosis, shown in your track timeline.", sortOrder: 1 },
  { type: "why", title: "Expert technicians", body: "Hands-on experience across phones, tablets, MacBooks, and watches.", sortOrder: 2 },
  { type: "why", title: "Free diagnostics path", body: "DIY troubleshoot first, then a clear repair quote — no pressure sales.", sortOrder: 3 },
  { type: "why", title: "Planned store visits", body: "Raising a request in advance helps technicians prepare parts and schedule — so your visit is smoother.", sortOrder: 4 },
  { type: "why", title: "Warranty on eligible repairs", body: "Parts and workmanship covered for the warranty period set in Site settings.", sortOrder: 5 },

  { type: "trust", title: "Free DIY first", body: "We share clear troubleshooting steps before asking you to visit — no pressure sales.", sortOrder: 0 },
  { type: "trust", title: "Price lock", body: "Online estimates stay valid for the price-lock days set in Site settings — no silent price jumps.", sortOrder: 1 },
  { type: "trust", title: "Privacy first", body: "We never access photos without permission. No sign-out or factory reset required.", sortOrder: 2 },
  { type: "trust", title: "Consented gallery", body: "Before/after repair photos are published only with the customer’s written consent.", sortOrder: 3 },

  { type: "testimonial", title: "Adil Khan", subtitle: "iPhone 15 Pro", body: "Professional service and genuine parts. The phone was ready on time and the track updates kept me calm.", sortOrder: 0 },
  { type: "testimonial", title: "Bharath Kumar", subtitle: "Google Pixel", body: "Screen replaced quickly with a clear price upfront. Store visit was smooth and on time.", sortOrder: 1 },
  { type: "testimonial", title: "Anisha", subtitle: "Samsung Galaxy Fold", body: "Fair pricing on a tricky fold issue. Same-day turnaround and honest communication throughout.", sortOrder: 2 },
  { type: "testimonial", title: "Aaditi Srinivas", subtitle: "MacBook", body: "Cracked MacBook screen fixed and looking new again. Clear estimate and smooth store visit.", sortOrder: 3 },
  { type: "testimonial", title: "Sushmita K", subtitle: "iPhone", body: "Screen and battery done fast. Privacy pledge meant I didn’t have to wipe my phone — huge plus.", sortOrder: 4 },

  { type: "faq", title: "What devices do you repair?", body: "Mobile phones, tablets, MacBooks/laptops, and smartwatches — screens, batteries, charging ports, cameras, software, and more.", sortOrder: 0 },
  { type: "faq", title: "How soon should I bring my phone after requesting?", body: "Please submit your device at the store within 3 days of raising a repair request. After that the request may become null and void and you’ll need to raise a fresh one.", sortOrder: 1 },
  { type: "faq", title: "Why raise a repair request online?", body: "It helps our technicians know about upcoming work and plan parts and time accordingly — so your visit is faster and smoother.", sortOrder: 2 },
  { type: "faq", title: "How long does a repair take?", body: "Many common jobs (screen, battery) can be same-day when parts are in stock. Complex work may take longer — you’ll see every status on Track.", sortOrder: 3 },
  { type: "faq", title: "Is there a warranty?", body: "Eligible repairs include warranty on parts and workmanship for the period shown on the site. We’ll note coverage when your repair is completed.", sortOrder: 4 },
  { type: "faq", title: "How do I know the price?", body: "Use Check price for an instant estimate, then book. Online estimates are locked for a set number of days when you visit.", sortOrder: 5 },
  { type: "faq", title: "Is my data safe?", body: "We never access photos without permission. No sign-out or factory reset required. Read our Privacy pledge for full details.", sortOrder: 6 },
];

let seedPromise: Promise<void> | null = null;

/** Seed empty CMS once per process. Soft migrations run only when empty. */
export async function ensureContentSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const count = await prisma.contentItem.count();
      if (count > 0) return;

      await prisma.contentItem.createMany({
        data: SEED.map((s) => ({
          type: s.type,
          key: s.key || null,
          title: s.title,
          subtitle: s.subtitle || null,
          body: s.body || null,
          meta: s.meta ? JSON.stringify(s.meta) : null,
          sortOrder: s.sortOrder,
          active: true,
        })),
      });
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export async function listContent(
  type?: ContentType,
  opts?: { activeOnly?: boolean }
): Promise<ContentItemDto[]> {
  await ensureContentSeeded();
  return prisma.contentItem.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(opts?.activeOnly ? { active: true } : {}),
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

const getCachedActiveContent = unstable_cache(
  async () => listContent(undefined, { activeOnly: true }),
  ["content-active-all"],
  { tags: [CACHE_TAGS.content], revalidate: 300 }
);

/** All active CMS rows — one cached query for the marketing site. */
export const getAllActiveContent = cache(() => getCachedActiveContent());

export async function getContentByType(
  type: ContentType
): Promise<ContentItemDto[]> {
  const all = await getAllActiveContent();
  return all.filter((item) => item.type === type);
}

export type { PricingContext } from "./pricing";
import type { PricingContext } from "./pricing";

export async function getPricingContext(): Promise<PricingContext> {
  const { getStoreSettings } = await import("./store");
  const [store, services, brands, devices] = await Promise.all([
    getStoreSettings(),
    getContentByType("service"),
    getContentByType("brand"),
    getContentByType("device"),
  ]);

  const baseByIssue: Record<string, number> = {};
  for (const s of services) {
    const key = (s.key || s.title).toLowerCase();
    const meta = parseMeta(s.meta);
    const price = Number(meta.basePrice);
    if (!Number.isNaN(price) && price > 0) baseByIssue[key] = price;
  }

  const brandMult: Record<string, number> = {};
  for (const b of brands) {
    const key = (b.key || b.title).toLowerCase();
    const meta = parseMeta(b.meta);
    const m = Number(meta.multiplier);
    brandMult[key] = !Number.isNaN(m) && m > 0 ? m : 1;
  }

  const deviceMult: Record<string, number> = {};
  for (const d of devices) {
    const key = (d.key || d.title).toLowerCase();
    const meta = parseMeta(d.meta);
    const m = Number(meta.multiplier);
    deviceMult[key] = !Number.isNaN(m) && m > 0 ? m : 1;
  }

  return {
    baseByIssue,
    brandMult,
    deviceMult,
    doorstepFee: store.doorstepFee,
    priceLockDays: store.priceLockDays,
    warrantyDays: store.warrantyDays,
  };
}
