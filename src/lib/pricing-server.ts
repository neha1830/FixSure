import { getPricingContext } from "./site-content";
import { getStoreSettings } from "./store";
import {
  estimateRepairChargeFromContext,
  type PriceRange,
} from "./pricing";

export async function estimateRepairCharge(opts: {
  brand: string;
  issueCategory: string;
  deviceType?: string;
  serviceMode?: string;
}): Promise<PriceRange> {
  const ctx = await getPricingContext();
  return estimateRepairChargeFromContext(opts, ctx);
}

export async function getPriceLockDays(): Promise<number> {
  const store = await getStoreSettings();
  return store.priceLockDays;
}
