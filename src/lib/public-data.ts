import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { CACHE_TAGS } from "./cache-tags";

const getCachedGalleryPreview = unstable_cache(
  async () =>
    prisma.galleryItem.findMany({
      where: { published: true, consentGiven: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
  ["gallery-preview"],
  { tags: [CACHE_TAGS.gallery], revalidate: 300 }
);

const getCachedGalleryAll = unstable_cache(
  async () =>
    prisma.galleryItem.findMany({
      where: { published: true, consentGiven: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["gallery-all"],
  { tags: [CACHE_TAGS.gallery], revalidate: 300 }
);

const getCachedApprovedReviews = unstable_cache(
  async (take: number) =>
    prisma.customerReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ["reviews-approved"],
  { tags: [CACHE_TAGS.reviews], revalidate: 60 }
);

export const getGalleryPreview = cache(() => getCachedGalleryPreview());
export const getPublicGallery = cache(() => getCachedGalleryAll());
export const getApprovedReviews = cache((take = 6) =>
  getCachedApprovedReviews(take)
);
