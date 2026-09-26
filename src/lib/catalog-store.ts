import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import {
  FIX_CATEGORIES,
  FIX_CATEGORY_META,
  type FixCategory,
} from "./fix-catalog";

export const CATALOG_CATEGORY_META = FIX_CATEGORY_META;

let seedPromise: Promise<void> | null = null;

export async function ensureCatalogSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        await prisma.$transaction(async (tx) => {
          const count = await tx.catalogSeries.count();
          if (count > 0) return;
          for (const cat of FIX_CATEGORIES) {
            for (const [si, series] of cat.series.entries()) {
              const models = cat.models.filter((m) => m.seriesId === series.id);
              await tx.catalogSeries.create({
                data: {
                  id: series.id,
                  categoryId: cat.id,
                  label: series.label,
                  brand: series.brand,
                  imageUrl: series.image,
                  published: true,
                  sortOrder: si,
                  models: {
                    create: models.map((m, i) => ({
                      id: m.id,
                      label: m.label,
                      imageUrl: m.image,
                      published: true,
                      sortOrder: i,
                    })),
                  },
                },
              });
            }
          }
        }, { timeout: 60000 });
      } catch (err) {
        seedPromise = null;
        console.warn("Catalog seed skipped:", err);
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

function toFixCategories(
  rows: Array<{
    id: string;
    categoryId: string;
    label: string;
    brand: string;
    imageUrl: string;
    sortOrder: number;
    models: Array<{
      id: string;
      seriesId: string;
      label: string;
      details: string | null;
      imageUrl: string;
      sortOrder: number;
    }>;
  }>
): FixCategory[] {
  return FIX_CATEGORY_META.map((meta) => {
    const series = rows
      .filter((s) => s.categoryId === meta.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      id: meta.id,
      label: meta.label,
      deviceType: meta.deviceType,
      series: series.map((s) => ({
        id: s.id,
        label: s.label,
        brand: s.brand,
        image: s.imageUrl,
      })),
      models: series.flatMap((s) =>
        [...s.models]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((m) => ({
            id: m.id,
            seriesId: m.seriesId,
            label: m.label,
            image: m.imageUrl,
            details: m.details || undefined,
          }))
      ),
    };
  });
}

export async function listCatalogAdmin() {
  await ensureCatalogSeeded();
  return prisma.catalogSeries.findMany({
    include: { models: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
}

const getCachedPublishedCatalog = unstable_cache(
  async () => {
    await ensureCatalogSeeded();
    try {
      const rows = await prisma.catalogSeries.findMany({
        where: { published: true },
        include: {
          models: {
            where: { published: true },
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      });
      const mapped = toFixCategories(rows);
      return mapped.some((c) => c.series.length) ? mapped : FIX_CATEGORIES;
    } catch (err) {
      console.warn("Catalog list unavailable:", err);
      return FIX_CATEGORIES;
    }
  },
  ["catalog-published-v7"],
  { tags: [CACHE_TAGS.catalog], revalidate: 120 }
);

export const getPublishedCatalog = cache(() => getCachedPublishedCatalog());
