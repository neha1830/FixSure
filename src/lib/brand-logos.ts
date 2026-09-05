import { parseMeta } from "@/lib/site-content";

const BRAND_FILES: Record<string, string> = {
  apple: "/brands/apple.svg",
  samsung: "/brands/samsung.svg",
  xiaomi: "/brands/xiaomi.svg",
  vivo: "/brands/vivo.svg",
  oneplus: "/brands/oneplus.svg",
  oppo: "/brands/oppo.svg",
  google: "/brands/google.svg",
  realme: "/brands/realme.svg",
  motorola: "/brands/motorola.svg",
  iqoo: "/brands/iqoo.svg",
  poco: "/brands/poco.svg",
  nothing: "/brands/nothing.svg",
  nokia: "/brands/nokia.svg",
  honor: "/brands/honor.svg",
  asus: "/brands/asus.svg",
  huawei: "/brands/huawei.svg",
};

export function getBrandLogoSrc(opts: {
  key?: string | null;
  title: string;
  meta?: string | null;
}): string | null {
  const parsed = parseMeta(opts.meta);
  if (typeof parsed.logoUrl === "string" && parsed.logoUrl.trim()) {
    return parsed.logoUrl.trim();
  }

  const key = (opts.key || opts.title).toLowerCase().replace(/\s+/g, "");
  return BRAND_FILES[key] || null;
}
