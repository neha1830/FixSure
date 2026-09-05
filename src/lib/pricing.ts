const BASE_REPAIR: Record<string, number> = {
  screen: 2499,
  battery: 1499,
  charging: 999,
  camera: 1799,
  speaker: 899,
  software: 499,
  water: 2999,
  other: 799,
};

const BRAND_MULTIPLIER: Record<string, number> = {
  apple: 1.8,
  samsung: 1.25,
  google: 1.35,
  oneplus: 1.15,
  xiaomi: 0.9,
  vivo: 0.85,
  oppo: 0.85,
  realme: 0.8,
  motorola: 0.95,
  nothing: 1.1,
};

/** Online estimates stay locked for this many days when you visit the store. */
export const PRICE_LOCK_DAYS = 7;

export function getEstimateValidUntil(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + PRICE_LOCK_DAYS);
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

export function estimateRepairCharge(opts: {
  brand: string;
  issueCategory: string;
}): number {
  const base = BASE_REPAIR[opts.issueCategory] ?? BASE_REPAIR.other;
  const mult = BRAND_MULTIPLIER[opts.brand.toLowerCase()] ?? 1;
  return Math.round((base * mult) / 50) * 50;
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
