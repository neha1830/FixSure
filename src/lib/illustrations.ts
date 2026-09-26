const P = "/images/products/stage";

export function serviceIllustration(key: string | null | undefined): string {
  const k = (key || "").toLowerCase();
  if (k === "screen" || k === "glass") return "/images/fx-spot-phone.png";
  if (k === "backglass") return "/images/service-backglass.png";
  if (k === "battery") return "/images/fx-spot-tablet.png";
  if (k === "charging") return "/images/service-charging.png";
  if (k === "camera") return "/images/service-camera.png";
  return "/images/fx-spot-phone.png";
}

export function deviceIllustration(key: string | null | undefined): string {
  const k = (key || "").toLowerCase();
  if (k === "tablet" || k === "ipad") return `${P}/ipad-10.jpg`;
  if (k === "macbook" || k.includes("laptop")) return `${P}/mba-m3-15.jpg`;
  if (k === "smartwatch" || k.includes("watch")) return `${P}/aw-ultra2.jpg`;
  return `${P}/iphone-16-plus.jpg`;
}

export function startingPriceFromMeta(meta: string | null | undefined): number | null {
  if (!meta) return null;
  try {
    const parsed = JSON.parse(meta) as Record<string, unknown>;
    const min = Number(
      parsed.basePriceMin ?? parsed.priceCopy ?? parsed.basePrice
    );
    return !Number.isNaN(min) && min > 0 ? min : null;
  } catch {
    return null;
  }
}
