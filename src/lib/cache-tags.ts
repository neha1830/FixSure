export const CACHE_TAGS = {
  store: "store-settings",
  content: "site-content",
  gallery: "gallery-public",
  reviews: "reviews-public",
  parts: "parts-public",
  catalog: "catalog-public",
} as const;

export type CacheTagKey = keyof typeof CACHE_TAGS;
