import { revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTagKey } from "./cache-tags";

/** Invalidate marketing/public caches after admin writes. Server-only. */
export function revalidatePublicSite(...tags: CacheTagKey[]): void {
  const unique = tags.length
    ? [...new Set(tags)]
    : (Object.keys(CACHE_TAGS) as CacheTagKey[]);
  for (const key of unique) {
    revalidateTag(CACHE_TAGS[key], "max");
  }
}
