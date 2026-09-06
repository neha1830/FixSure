"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
} from "@/lib/parts-constants";

export type CataloguePart = {
  id: string;
  title: string;
  description: string | null;
  deviceCategory: string;
  brand: string | null;
  sku: string | null;
  quality: string;
  compatibility: string | null;
  price: number;
  imageUrl: string | null;
  inStock: boolean;
};

type Props = {
  parts: CataloguePart[];
  storePhone: string;
  storeName: string;
  storeAddress: string;
};

const CATEGORY_FALLBACK: Record<string, string> = {
  phone: "/parts/phone.svg",
  tablet: "/parts/tablet.svg",
  macbook: "/parts/laptop.svg",
  smartwatch: "/parts/watch.svg",
  other: "/parts/other.svg",
};

function qualityLabel(key: string) {
  return PART_QUALITIES.find((q) => q.key === key)?.label || key;
}

function categoryLabel(key: string) {
  return PART_DEVICE_CATEGORIES.find((c) => c.key === key)?.label || key;
}

export function PartsCatalogue({
  parts,
  storePhone,
  storeName,
  storeAddress,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [quality, setQuality] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      if (category !== "all" && p.deviceCategory !== category) return false;
      if (quality !== "all" && p.quality !== quality) return false;
      if (stockOnly && !p.inStock) return false;
      if (!deferredQuery) return true;
      const hay = [
        p.title,
        p.brand,
        p.sku,
        p.compatibility,
        p.description,
        p.deviceCategory,
        qualityLabel(p.quality),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(deferredQuery);
    });
  }, [parts, category, quality, stockOnly, deferredQuery]);

  const tel = storePhone.replace(/\s/g, "");

  return (
    <div>
      <p className="mt-2 text-sm text-ink-soft/65">
        Visit {storeName} · {storeAddress} ·{" "}
        <a href={`tel:${tel}`} className="text-teal">
          {storePhone}
        </a>
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white/85 p-4 sm:p-5">
        <div>
          <label htmlFor="parts-search" className="field-label">
            Search parts
          </label>
          <input
            id="parts-search"
            className="field"
            type="search"
            placeholder="e.g. iPhone screen, battery, MacBook…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <p className="field-label">Device</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === "all"}
              onClick={() => setCategory("all")}
              label="All"
            />
            {PART_DEVICE_CATEGORIES.map((c) => (
              <FilterChip
                key={c.key}
                active={category === c.key}
                onClick={() => setCategory(c.key)}
                label={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">Quality</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={quality === "all"}
              onClick={() => setQuality("all")}
              label="All"
            />
            {PART_QUALITIES.map((q) => (
              <FilterChip
                key={q.key}
                active={quality === q.key}
                onClick={() => setQuality(q.key)}
                label={q.label}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft/80">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
          />
          In stock only
        </label>

        <p className="text-sm text-ink-soft/60">
          Showing {filtered.length} of {parts.length} parts
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-ink-soft/70">
          No parts match your search. Try another term or{" "}
          <button
            type="button"
            className="text-teal underline"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setQuality("all");
              setStockOnly(false);
            }}
          >
            clear filters
          </button>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const src =
              p.imageUrl ||
              CATEGORY_FALLBACK[p.deviceCategory] ||
              CATEGORY_FALLBACK.other;
            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white/85 shadow-[var(--shadow)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="aspect-[16/10] w-full bg-[#E8F4F2] object-cover"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-md bg-ink/5 px-2 py-1">
                      {categoryLabel(p.deviceCategory)}
                    </span>
                    <span className="rounded-md bg-teal/10 px-2 py-1 text-teal">
                      {qualityLabel(p.quality)}
                    </span>
                    {!p.inStock && (
                      <span className="rounded-md bg-ink/10 px-2 py-1">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-semibold leading-snug">{p.title}</h2>
                  {p.brand && (
                    <p className="mt-1 text-sm text-ink-soft/65">{p.brand}</p>
                  )}
                  {p.compatibility && (
                    <p className="mt-2 text-xs text-ink-soft/60">
                      Compatible: {p.compatibility}
                    </p>
                  )}
                  {p.description && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft/75">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-4 text-2xl font-bold text-teal">
                    ₹{p.price.toLocaleString("en-IN")}
                  </p>
                  {p.sku && (
                    <p className="mt-1 text-xs text-ink-soft/50">SKU {p.sku}</p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={`tel:${tel}`} className="btn-primary !py-2 text-sm">
                      Call to buy
                    </a>
                    <Link
                      href="/contact"
                      className="btn-secondary !py-2 text-sm"
                    >
                      Enquire
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-teal text-white"
          : "border border-[var(--line)] bg-white text-ink-soft hover:border-teal/40"
      }`}
    >
      {label}
    </button>
  );
}
