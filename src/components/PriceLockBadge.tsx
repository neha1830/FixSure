"use client";

import { formatEstimateExpiry, isEstimateValid, PRICE_LOCK_DAYS } from "@/lib/pricing";

type Props = {
  validUntil?: string | Date | null;
  amountLabel?: string;
  className?: string;
};

export function PriceLockBadge({
  validUntil,
  amountLabel = "estimate",
  className = "",
}: Props) {
  const until = validUntil ? new Date(validUntil) : null;
  const valid = until ? isEstimateValid(until) : true;
  const dateText = until
    ? formatEstimateExpiry(until)
    : `${PRICE_LOCK_DAYS} days from today`;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        valid
          ? "border-teal/25 bg-mint/40 text-teal-deep"
          : "border-amber/30 bg-amber-soft/50 text-ink-soft"
      } ${className}`}
    >
      <p className="font-semibold">
        {valid ? "Price lock active" : "Price lock expired"}
      </p>
      <p className="mt-1 leading-relaxed opacity-90">
        {valid
          ? `This ${amountLabel} is held for ${PRICE_LOCK_DAYS} days — valid until ${dateText}. Visit the store before then to honour it (final amount still confirmed after diagnosis/inspection).`
          : `This ${amountLabel} expired on ${dateText}. Ask us for a fresh quote — market parts prices change.`}
      </p>
    </div>
  );
}
