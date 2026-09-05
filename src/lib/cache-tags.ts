import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  store: "store-settings",
  content: "site-content",
  gallery: "gallery-public",
  reviews: "reviews-public",
} as const;

/** Invalidate marketing/public caches after admin writes. */
export function revalidatePublicSite(
  ...tags: (keyof typeof CACHE_TAGS)[]
): void {
  const unique = tags.length
    ? [...new Set(tags)]
    : (Object.keys(CACHE_TAGS) as (keyof typeof CACHE_TAGS)[]);
  for (const key of unique) {
    revalidateTag(CACHE_TAGS[key], "max");
  }
}
