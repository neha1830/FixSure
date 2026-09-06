import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import {
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
  type PartDeviceCategory,
} from "./parts-constants";

export {
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
  type PartDeviceCategory,
};

/** Bundled category placeholders in /public/parts (committed to git). */
export const PART_CATEGORY_IMAGES: Record<PartDeviceCategory, string> = {
  phone: "/parts/phone.svg",
  tablet: "/parts/tablet.svg",
  macbook: "/parts/laptop.svg",
  smartwatch: "/parts/watch.svg",
  other: "/parts/other.svg",
};

function defaultImageFor(category: string) {
  return (
    PART_CATEGORY_IMAGES[category as PartDeviceCategory] ||
    PART_CATEGORY_IMAGES.other
  );
}

const PART_SEEDS: Array<{
  title: string;
  description: string;
  deviceCategory: PartDeviceCategory;
  brand?: string;
  quality: string;
  compatibility: string;
  price: number;
  sku: string;
  sortOrder: number;
}> = [
  {
    title: "iPhone 13 / 13 Pro display (copy)",
    description:
      "Aftermarket LCD/OLED assembly. Part-only price; fitting available in-store for an extra labour charge.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPhone 13, 13 Pro",
    price: 2499,
    sku: "PH-IP13-SCR-C",
    sortOrder: 0,
  },
  {
    title: "iPhone 13 / 13 Pro display (original)",
    description:
      "Original-grade display module. Part-only price; fitting available in-store.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "ORIGINAL",
    compatibility: "iPhone 13, 13 Pro",
    price: 8999,
    sku: "PH-IP13-SCR-O",
    sortOrder: 1,
  },
  {
    title: "Android mid-range battery (copy)",
    description:
      "Compatible Li-ion pack for common Samsung / Xiaomi / Vivo models. Confirm model before purchase.",
    deviceCategory: "phone",
    quality: "COPY",
    compatibility: "Most mid-range Android (ask us to match)",
    price: 899,
    sku: "PH-AND-BAT-C",
    sortOrder: 2,
  },
  {
    title: "iPad 9th gen digitizer / glass",
    description: "Front glass / digitizer for tablet repair or DIY with care.",
    deviceCategory: "tablet",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPad 9th generation (10.2\")",
    price: 3499,
    sku: "TB-IPAD9-GLS",
    sortOrder: 0,
  },
  {
    title: "MacBook Air M1 battery",
    description:
      "Replacement battery pack for MacBook Air M1. Professional fitting recommended.",
    deviceCategory: "macbook",
    brand: "Apple",
    quality: "OEM",
    compatibility: "MacBook Air M1 (A2337)",
    price: 6999,
    sku: "LP-MBA-M1-BAT",
    sortOrder: 0,
  },
  {
    title: "MacBook USB-C charging port board",
    description: "I/O board with USB-C ports for select MacBook models.",
    deviceCategory: "macbook",
    brand: "Apple",
    quality: "OEM",
    compatibility: "Ask for exact MacBook year/model",
    price: 4499,
    sku: "LP-MB-USBC",
    sortOrder: 1,
  },
  {
    title: "Windows laptop 15.6\" screen (copy)",
    description:
      "Compatible 15.6\" IPS panel for common HP / Dell / Lenovo chassis. Confirm connector and bezel before purchase.",
    deviceCategory: "macbook",
    quality: "COPY",
    compatibility: "Many 15.6\" Windows laptops (eDP — confirm model)",
    price: 3999,
    sku: "LP-WIN156-SCR-C",
    sortOrder: 2,
  },
  {
    title: "Apple Watch Series 6 / SE screen (copy)",
    description: "Compatible OLED screen assembly for watch repairs.",
    deviceCategory: "smartwatch",
    brand: "Apple",
    quality: "COPY",
    compatibility: "Apple Watch Series 6 / SE (40/44mm — confirm size)",
    price: 2999,
    sku: "WT-AW6-SCR-C",
    sortOrder: 0,
  },
  {
    title: "Smartwatch charging dock (universal)",
    description: "Magnetic / pin dock suitable for many Android smartwatches.",
    deviceCategory: "smartwatch",
    quality: "COPY",
    compatibility: "Most pin-charge Android watches",
    price: 499,
    sku: "WT-DOCK-UNI",
    sortOrder: 1,
  },
  {
    title: "Universal tool kit (opening / pry)",
    description:
      "Basic pry tools and suction cup for careful DIY work. Not a device part — sold as accessories.",
    deviceCategory: "other",
    quality: "OEM",
    compatibility: "Phones, tablets, and thin laptops",
    price: 299,
    sku: "OT-TOOL-KIT",
    sortOrder: 0,
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensurePartsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const count = await prisma.partItem.count();
      if (count === 0) {
        await prisma.partItem.createMany({
          data: PART_SEEDS.map((p) => ({
            title: p.title,
            description: p.description,
            deviceCategory: p.deviceCategory,
            brand: p.brand || null,
            sku: p.sku,
            quality: p.quality,
            compatibility: p.compatibility,
            price: p.price,
            imageUrl: defaultImageFor(p.deviceCategory),
            inStock: true,
            published: true,
            sortOrder: p.sortOrder,
          })),
        });
        return;
      }

      const missing = await prisma.partItem.findMany({
        where: { OR: [{ imageUrl: null }, { imageUrl: "" }] },
        select: { id: true, deviceCategory: true },
      });
      for (const row of missing) {
        await prisma.partItem.update({
          where: { id: row.id },
          data: { imageUrl: defaultImageFor(row.deviceCategory) },
        });
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

const getCachedPublishedParts = unstable_cache(
  async () => {
    await ensurePartsSeeded();
    return prisma.partItem.findMany({
      where: { published: true },
      orderBy: [
        { deviceCategory: "asc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
  },
  ["parts-published"],
  { tags: [CACHE_TAGS.parts], revalidate: 120 }
);

export const getPublishedParts = cache(() => getCachedPublishedParts());

export async function listAllParts() {
  await ensurePartsSeeded();
  return prisma.partItem.findMany({
    orderBy: [
      { deviceCategory: "asc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}
