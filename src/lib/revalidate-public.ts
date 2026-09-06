import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTagKey } from "./cache-tags";

const PATHS_BY_TAG: Record<CacheTagKey, string[]> = {
  store: ["/", "/privacy", "/contact", "/price", "/repair", "/reviews", "/parts"],
  content: ["/", "/price", "/repair", "/troubleshoot"],
  gallery: ["/", "/gallery"],
  reviews: ["/", "/reviews"],
  parts: ["/", "/parts"],
};

/** Invalidate marketing/public caches after admin writes. Server-only. */
export function revalidatePublicSite(...tags: CacheTagKey[]): void {
  const unique = tags.length
    ? [...new Set(tags)]
    : (Object.keys(CACHE_TAGS) as CacheTagKey[]);

  const paths = new Set<string>();
  for (const key of unique) {
    revalidateTag(CACHE_TAGS[key], "max");
    for (const path of PATHS_BY_TAG[key]) paths.add(path);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
}
