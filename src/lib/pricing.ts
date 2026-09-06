/** Client-safe pricing helpers (no server/DB imports). */

export type PriceRange = { min: number; max: number };

export type PricingContext = {
  baseByIssue: Record<string, PriceRange>;
  brandMult: Record<string, number>;
  deviceMult: Record<string, number>;
  doorstepFee: number;
  priceLockDays: number;
  warrantyDays: number;
};

/** Fallback all-in ranges: copy parts (min) → original parts (max). */
const FALLBACK_BASE: Record<string, PriceRange> = {
  screen: { min: 1999, max: 4499 },
  glass: { min: 1499, max: 2999 },
  backglass: { min: 1799, max: 3999 },
  battery: { min: 999, max: 2499 },
  charging: { min: 699, max: 1799 },
  camera: { min: 1299, max: 3499 },
  speaker: { min: 599, max: 1699 },
  software: { min: 399, max: 999 },
  water: { min: 1999, max: 5999 },
  other: { min: 499, max: 1999 },
};

/** @deprecated Use getStoreSettings().priceLockDays — kept for client badge fallback */
export const PRICE_LOCK_DAYS = 7;

/** @deprecated Use getStoreSettings().doorstepFee */
export const DOORSTEP_FEE = 299;

export function getEstimateValidUntil(
  from: Date = new Date(),
  priceLockDays: number = PRICE_LOCK_DAYS
): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + priceLockDays);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isEstimateValid(
  validUntil: Date | string | null | undefined
): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() >= Date.now();
}

export function formatEstimateExpiry(validUntil: Date | string): string {
  return new Date(validUntil).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPriceRange(range: PriceRange): string {
  if (range.min === range.max) {
    return `₹${range.min.toLocaleString("en-IN")}`;
  }
  return `₹${range.min.toLocaleString("en-IN")} – ₹${range.max.toLocaleString("en-IN")}`;
}

function applyMultipliers(
  base: number,
  brandMult: number,
  deviceMult: number,
  doorstepFee: number,
  serviceMode?: string
): number {
  let total = Math.round((base * brandMult * deviceMult) / 50) * 50;
  if (serviceMode === "DOORSTEP") total += doorstepFee;
  return total;
}

/**
 * All-in estimate range: min = copy/compatible parts, max = original parts.
 * Both ends already include labour / technician charges baked into the base.
 */
export function estimateRepairChargeFromContext(
  opts: {
    brand: string;
    issueCategory: string;
    deviceType?: string;
    serviceMode?: string;
  },
  ctx: PricingContext
): PriceRange {
  const key = opts.issueCategory.toLowerCase();
  const range =
    ctx.baseByIssue[key] ??
    ctx.baseByIssue.other ??
    FALLBACK_BASE[key] ??
    FALLBACK_BASE.other;
  const brandMult =
    ctx.brandMult[opts.brand.toLowerCase()] ??
    ctx.brandMult[opts.brand.toLowerCase().replace(/\s+/g, "")] ??
    1;
  const deviceKey = (opts.deviceType || "phone").toLowerCase();
  const deviceMult = ctx.deviceMult[deviceKey] ?? 1;

  const min = applyMultipliers(
    range.min,
    brandMult,
    deviceMult,
    ctx.doorstepFee,
    opts.serviceMode
  );
  const max = applyMultipliers(
    range.max,
    brandMult,
    deviceMult,
    ctx.doorstepFee,
    opts.serviceMode
  );

  return { min: Math.min(min, max), max: Math.max(min, max) };
}

/** @deprecated Prefer estimateRepairChargeFromContext range; returns mid-point. */
export function estimateRepairChargeSingleFromContext(
  opts: Parameters<typeof estimateRepairChargeFromContext>[0],
  ctx: PricingContext
): number {
  const r = estimateRepairChargeFromContext(opts, ctx);
  return Math.round((r.min + r.max) / 2 / 50) * 50;
}

const SELL_BASE: Record<string, number> = {
  apple: 22000,
  samsung: 14000,
  google: 16000,
  oneplus: 12000,
  xiaomi: 8000,
  vivo: 7000,
  oppo: 7000,
  realme: 6000,
  motorola: 7500,
  nothing: 11000,
};

const CONDITION_MULT: Record<string, number> = {
  excellent: 1,
  good: 0.82,
  fair: 0.62,
  poor: 0.4,
};

const STORAGE_BONUS: Record<string, number> = {
  "64GB": 0,
  "128GB": 1500,
  "256GB": 3500,
  "512GB": 6000,
  "1TB": 9000,
};

export function estimateSellPrice(opts: {
  brand: string;
  storage: string;
  condition: string;
  batteryHealth?: string;
  hasBox?: boolean;
  hasCharger?: boolean;
}): number {
  const base = SELL_BASE[opts.brand.toLowerCase()] ?? 5000;
  const cond = CONDITION_MULT[opts.condition] ?? 0.7;
  const storage = STORAGE_BONUS[opts.storage] ?? 1000;
  let price = (base + storage) * cond;

  const battery = parseInt(opts.batteryHealth || "80", 10);
  if (!Number.isNaN(battery)) {
    if (battery >= 90) price *= 1.05;
    else if (battery < 80) price *= 0.9;
    else if (battery < 70) price *= 0.8;
  }

  if (opts.hasBox) price += 400;
  if (opts.hasCharger) price += 300;

  return Math.max(500, Math.round(price / 100) * 100);
}
