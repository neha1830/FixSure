import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import {
  PART_CATEGORY_IMAGES,
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
  type PartDeviceCategory,
} from "./parts-constants";

export {
  PART_CATEGORY_IMAGES,
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
  type PartDeviceCategory,
};

const PART_PHOTOS = {
  phoneScreen: "/images/parts/part-phone-screen.png",
  phoneBattery: "/images/parts/part-phone-battery.png",
  charging: "/images/parts/part-charging.png",
  camera: "/images/parts/part-camera.png",
  backglass: "/images/parts/part-backglass.png",
  speaker: "/images/parts/part-speaker.png",
  tabletGlass: "/images/parts/part-tablet-glass.png",
  laptopBattery: "/images/parts/part-laptop-battery.png",
  laptopScreen: "/images/parts/part-laptop-screen.png",
  watchScreen: "/images/parts/part-watch-screen.png",
  watchDock: "/images/parts/part-watch-dock.png",
  toolkit: "/images/parts/part-toolkit.png",
} as const;

function defaultImageFor(category: string) {
  return (
    PART_CATEGORY_IMAGES[category as PartDeviceCategory] ||
    PART_CATEGORY_IMAGES.other
  );
}

function isPlaceholderImage(url: string | null | undefined) {
  if (!url) return true;
  return url.startsWith("/parts/") && url.endsWith(".svg");
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
  imageUrl: string;
}> = [
  {
    title: "iPhone 13 / 13 Pro display (copy)",
    description:
      "Aftermarket OLED assembly. Part-only price; fitting available in-store for an extra labour charge.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPhone 13, 13 Pro",
    price: 2499,
    sku: "PH-IP13-SCR-C",
    sortOrder: 0,
    imageUrl: PART_PHOTOS.phoneScreen,
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
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "iPhone 14 / 14 Plus display (copy)",
    description:
      "Compatible OLED assembly for 14-series. Confirm mini vs Plus size before buying.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPhone 14, 14 Plus",
    price: 3299,
    sku: "PH-IP14-SCR-C",
    sortOrder: 2,
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "iPhone 15 / 15 Pro display (copy)",
    description:
      "Aftermarket OLED assembly for 15-series. Dynamic Island cut-out — confirm Pro vs standard.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPhone 15, 15 Pro",
    price: 4499,
    sku: "PH-IP15-SCR-C",
    sortOrder: 3,
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "iPhone 12 / 12 Pro battery (OEM)",
    description:
      "OEM-grade Li-ion pack. Professional fitting recommended for water-seal.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "OEM",
    compatibility: "iPhone 12, 12 Pro",
    price: 1899,
    sku: "PH-IP12-BAT-O",
    sortOrder: 4,
    imageUrl: PART_PHOTOS.phoneBattery,
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
    sortOrder: 5,
    imageUrl: PART_PHOTOS.phoneBattery,
  },
  {
    title: "Samsung Galaxy A54 battery (copy)",
    description: "Compatible pack for A54 5G. Confirm 5000 mAh variant.",
    deviceCategory: "phone",
    brand: "Samsung",
    quality: "COPY",
    compatibility: "Galaxy A54 5G",
    price: 999,
    sku: "PH-A54-BAT-C",
    sortOrder: 6,
    imageUrl: PART_PHOTOS.phoneBattery,
  },
  {
    title: "Samsung Galaxy S23 / S23+ display (copy)",
    description:
      "Aftermarket AMOLED assembly. Confirm Plus vs standard before purchase.",
    deviceCategory: "phone",
    brand: "Samsung",
    quality: "COPY",
    compatibility: "Galaxy S23, S23+",
    price: 3999,
    sku: "PH-S23-SCR-C",
    sortOrder: 7,
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "Samsung Galaxy S24 Ultra display (copy)",
    description: "Compatible AMOLED assembly for S24 Ultra.",
    deviceCategory: "phone",
    brand: "Samsung",
    quality: "COPY",
    compatibility: "Galaxy S24 Ultra",
    price: 6999,
    sku: "PH-S24U-SCR-C",
    sortOrder: 8,
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "Google Pixel 8 display (copy)",
    description: "Aftermarket OLED assembly for Pixel 8.",
    deviceCategory: "phone",
    brand: "Google",
    quality: "COPY",
    compatibility: "Pixel 8",
    price: 3799,
    sku: "PH-PX8-SCR-C",
    sortOrder: 9,
    imageUrl: PART_PHOTOS.phoneScreen,
  },
  {
    title: "iPhone 14 back glass (copy)",
    description:
      "Replacement rear glass with camera cut-out. Laser-machine fitting recommended.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPhone 14",
    price: 1499,
    sku: "PH-IP14-BG-C",
    sortOrder: 10,
    imageUrl: PART_PHOTOS.backglass,
  },
  {
    title: "iPhone 13 rear camera (OEM)",
    description: "OEM-grade wide camera module. Confirm Pro vs standard.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "OEM",
    compatibility: "iPhone 13",
    price: 3499,
    sku: "PH-IP13-CAM-O",
    sortOrder: 11,
    imageUrl: PART_PHOTOS.camera,
  },
  {
    title: "OnePlus 12 charging port (copy)",
    description: "USB-C charge / data flex for OnePlus 12.",
    deviceCategory: "phone",
    brand: "OnePlus",
    quality: "COPY",
    compatibility: "OnePlus 12",
    price: 1299,
    sku: "PH-OP12-CHG-C",
    sortOrder: 12,
    imageUrl: PART_PHOTOS.charging,
  },
  {
    title: "iPhone ear speaker / receiver (OEM)",
    description: "Earpiece speaker for call audio. Common 12–14 series fit — confirm first.",
    deviceCategory: "phone",
    brand: "Apple",
    quality: "OEM",
    compatibility: "iPhone 12 / 13 / 14 (confirm model)",
    price: 799,
    sku: "PH-IP-EAR-O",
    sortOrder: 13,
    imageUrl: PART_PHOTOS.speaker,
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
    imageUrl: PART_PHOTOS.tabletGlass,
  },
  {
    title: "iPad Air 5 / M1 display (copy)",
    description: "Compatible LCD assembly for iPad Air 5 (2022).",
    deviceCategory: "tablet",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPad Air 5 (M1)",
    price: 5999,
    sku: "TB-IPADA5-SCR-C",
    sortOrder: 1,
    imageUrl: PART_PHOTOS.tabletGlass,
  },
  {
    title: "iPad Mini 6 digitizer (copy)",
    description: "Front glass / digitizer for iPad Mini 6.",
    deviceCategory: "tablet",
    brand: "Apple",
    quality: "COPY",
    compatibility: "iPad Mini 6",
    price: 2999,
    sku: "TB-IPADMINI6-GLS",
    sortOrder: 2,
    imageUrl: PART_PHOTOS.tabletGlass,
  },
  {
    title: "iPad Pro 11\" 2022 battery (OEM)",
    description: "OEM-grade battery pack. Professional fitting recommended.",
    deviceCategory: "tablet",
    brand: "Apple",
    quality: "OEM",
    compatibility: "iPad Pro 11-inch (2022)",
    price: 4499,
    sku: "TB-IPADP11-BAT-O",
    sortOrder: 3,
    imageUrl: PART_PHOTOS.phoneBattery,
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
    imageUrl: PART_PHOTOS.laptopBattery,
  },
  {
    title: "MacBook Air M2 battery",
    description: "Replacement battery pack for MacBook Air M2.",
    deviceCategory: "macbook",
    brand: "Apple",
    quality: "OEM",
    compatibility: "MacBook Air M2 (A2681)",
    price: 7999,
    sku: "LP-MBA-M2-BAT",
    sortOrder: 1,
    imageUrl: PART_PHOTOS.laptopBattery,
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
    sortOrder: 2,
    imageUrl: PART_PHOTOS.charging,
  },
  {
    title: "MacBook Pro 14\" display (copy)",
    description:
      "Compatible Liquid Retina XDR-style panel for 14-inch Pro (2021–2023). Confirm year.",
    deviceCategory: "macbook",
    brand: "Apple",
    quality: "COPY",
    compatibility: "MacBook Pro 14\" (2021–2023)",
    price: 18999,
    sku: "LP-MBP14-SCR-C",
    sortOrder: 3,
    imageUrl: PART_PHOTOS.laptopScreen,
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
    sortOrder: 4,
    imageUrl: PART_PHOTOS.laptopScreen,
  },
  {
    title: "Dell XPS 13 battery (OEM)",
    description: "OEM-grade pack for recent XPS 13 chassis. Confirm model number.",
    deviceCategory: "macbook",
    brand: "Dell",
    quality: "OEM",
    compatibility: "XPS 13 (ask for exact year)",
    price: 5499,
    sku: "LP-XPS13-BAT-O",
    sortOrder: 5,
    imageUrl: PART_PHOTOS.laptopBattery,
  },
  {
    title: "HP Pavilion 15 battery (copy)",
    description: "Compatible battery for common Pavilion 15 models.",
    deviceCategory: "macbook",
    brand: "HP",
    quality: "COPY",
    compatibility: "Pavilion 15 (confirm part number)",
    price: 2999,
    sku: "LP-PAV15-BAT-C",
    sortOrder: 6,
    imageUrl: PART_PHOTOS.laptopBattery,
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
    imageUrl: PART_PHOTOS.watchScreen,
  },
  {
    title: "Apple Watch Series 8 / 9 screen (copy)",
    description: "Compatible OLED assembly. Confirm 41 mm vs 45 mm.",
    deviceCategory: "smartwatch",
    brand: "Apple",
    quality: "COPY",
    compatibility: "Apple Watch Series 8 / 9",
    price: 3499,
    sku: "WT-AW89-SCR-C",
    sortOrder: 1,
    imageUrl: PART_PHOTOS.watchScreen,
  },
  {
    title: "Apple Watch Ultra screen (copy)",
    description: "Compatible OLED assembly for Ultra / Ultra 2. Confirm generation.",
    deviceCategory: "smartwatch",
    brand: "Apple",
    quality: "COPY",
    compatibility: "Apple Watch Ultra, Ultra 2",
    price: 7999,
    sku: "WT-AWU-SCR-C",
    sortOrder: 2,
    imageUrl: PART_PHOTOS.watchScreen,
  },
  {
    title: "Galaxy Watch 6 screen (copy)",
    description: "Compatible OLED assembly. Confirm 40 mm vs 44 mm.",
    deviceCategory: "smartwatch",
    brand: "Samsung",
    quality: "COPY",
    compatibility: "Galaxy Watch 6",
    price: 2799,
    sku: "WT-GW6-SCR-C",
    sortOrder: 3,
    imageUrl: PART_PHOTOS.watchScreen,
  },
  {
    title: "Smartwatch charging dock (universal)",
    description: "Magnetic / pin dock suitable for many Android smartwatches.",
    deviceCategory: "smartwatch",
    quality: "COPY",
    compatibility: "Most pin-charge Android watches",
    price: 499,
    sku: "WT-DOCK-UNI",
    sortOrder: 4,
    imageUrl: PART_PHOTOS.watchDock,
  },
  {
    title: "Apple Watch magnetic charger",
    description: "USB-C magnetic charging puck for Apple Watch.",
    deviceCategory: "smartwatch",
    brand: "Apple",
    quality: "OEM",
    compatibility: "Apple Watch Series 1 and later",
    price: 1499,
    sku: "WT-AW-CHG-O",
    sortOrder: 5,
    imageUrl: PART_PHOTOS.watchDock,
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
    imageUrl: PART_PHOTOS.toolkit,
  },
  {
    title: "Precision screwdriver set",
    description:
      "Magnetic bits for pentalobe, Phillips, and tri-point screws used on phones and laptops.",
    deviceCategory: "other",
    quality: "OEM",
    compatibility: "Most phones, watches, and laptops",
    price: 449,
    sku: "OT-DRV-SET",
    sortOrder: 1,
    imageUrl: PART_PHOTOS.toolkit,
  },
  {
    title: "Screen adhesive / seal kit",
    description:
      "Pre-cut Tesa-style adhesive for resealing phones after a screen or battery job.",
    deviceCategory: "other",
    quality: "OEM",
    compatibility: "Common iPhone and Android frames",
    price: 199,
    sku: "OT-ADH-KIT",
    sortOrder: 2,
    imageUrl: PART_PHOTOS.toolkit,
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensurePartsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        for (const p of PART_SEEDS) {
          const imageUrl = p.imageUrl || defaultImageFor(p.deviceCategory);
          const existing = await prisma.partItem.findFirst({
            where: { sku: p.sku },
            select: { id: true, imageUrl: true },
          });

          if (!existing) {
            await prisma.partItem.create({
              data: {
                title: p.title,
                description: p.description,
                deviceCategory: p.deviceCategory,
                brand: p.brand || null,
                sku: p.sku,
                quality: p.quality,
                compatibility: p.compatibility,
                price: p.price,
                imageUrl,
                inStock: true,
                published: true,
                sortOrder: p.sortOrder,
              },
            });
            continue;
          }

          if (isPlaceholderImage(existing.imageUrl)) {
            await prisma.partItem.update({
              where: { id: existing.id },
              data: { imageUrl },
            });
          }
        }

        const missingImages = await prisma.partItem.findMany({
          where: {
            OR: [
              { imageUrl: null },
              { imageUrl: "" },
              { imageUrl: { startsWith: "/parts/" } },
            ],
          },
          select: { id: true, deviceCategory: true, imageUrl: true },
        });
        for (const row of missingImages) {
          if (!isPlaceholderImage(row.imageUrl)) continue;
          await prisma.partItem.update({
            where: { id: row.id },
            data: { imageUrl: defaultImageFor(row.deviceCategory) },
          });
        }
      } catch (err) {
        // Table may not exist yet during first deploy before db push.
        console.warn("Parts seed skipped:", err);
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
    try {
      return await prisma.partItem.findMany({
        where: { published: true },
        orderBy: [
          { deviceCategory: "asc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      });
    } catch (err) {
      console.warn("Parts list unavailable:", err);
      return [];
    }
  },
  ["parts-published-v2"],
  { tags: [CACHE_TAGS.parts], revalidate: 120 }
);

export const getPublishedParts = cache(() => getCachedPublishedParts());

export async function listAllParts() {
  await ensurePartsSeeded();
  try {
    return await prisma.partItem.findMany({
      orderBy: [
        { deviceCategory: "asc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
  } catch (err) {
    console.warn("Parts admin list unavailable:", err);
    return [];
  }
}
