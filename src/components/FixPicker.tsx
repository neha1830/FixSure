"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceIcon, IconArrow } from "@/components/Icons";
import { getBrandLogoSrc } from "@/lib/brand-logos";
import {
  FIX_CATEGORY_META,
  type FixCategory,
  type FixCategoryId,
} from "@/lib/fix-catalog";
import { useFixCatalog } from "@/lib/use-fix-catalog";

export type FixDevice = {
  id: string;
  key: string | null;
  title: string;
  subtitle: string | null;
};

export type FixBrand = {
  id: string;
  key: string | null;
  title: string;
  meta: string | null;
};

/** Homepage teaser cards — deep-link into /price guided flow */
const HOME_TEASERS: Record<
  FixCategoryId,
  { label: string; hint: string; image: string; tint: string; series: string }[]
> = {
  phone: [
    {
      label: "iPhone",
      hint: "2007–2024 models",
      image: "/images/products/stage/iphone-16-plus.jpg",
      tint: "from-[#f0ebff] via-[#f7f4ff] to-[#e8f4ff]",
      series: "iphone",
    },
    {
      label: "Android",
      hint: "Samsung, Vivo, Oppo, Nothing…",
      image: "/images/products/stage/s24-ultra.jpg",
      tint: "from-[#e6fbf3] via-[#f0fff9] to-[#e8f6ff]",
      series: "samsung",
    },
  ],
  laptop: [
    {
      label: "Apple & Windows",
      hint: "MacBook, HP, Dell, Asus…",
      image: "/images/products/stage/mba-m3-15.jpg",
      tint: "from-[#eef4ff] via-[#f6f8ff] to-[#f3eeff]",
      series: "apple",
    },
    {
      label: "More brands",
      hint: "Lenovo, Acer, MSI & Others",
      image: "/images/products/stage/dell-xps-13.jpg",
      tint: "from-[#fff4e8] via-[#fffaf3] to-[#f3eeff]",
      series: "dell",
    },
  ],
  ipad: [
    {
      label: "iPad",
      hint: "2010–2024 lineup",
      image: "/images/products/stage/ipad-10.jpg",
      tint: "from-[#fff0e8] via-[#fff8f3] to-[#ffeef5]",
      series: "ipad",
    },
    {
      label: "iPad Pro",
      hint: "M4 & earlier Pro",
      image: "/images/products/stage/ipad-pro-m4.jpg",
      tint: "from-[#e5faf4] via-[#f2fffb] to-[#eaf4ff]",
      series: "ipad-pro",
    },
  ],
  smartwatch: [
    {
      label: "Apple Watch",
      hint: "Ultra, Series 6+",
      image: "/images/products/stage/aw-ultra2.jpg",
      tint: "from-[#ffe8d9] via-[#fff4ec] to-[#ffeef5]",
      series: "apple-watch",
    },
    {
      label: "Galaxy Watch",
      hint: "Watch 4–7",
      image: "/images/products/stage/gw-7.jpg",
      tint: "from-[#e4f0ff] via-[#f0f6ff] to-[#eaf4ff]",
      series: "galaxy-watch",
    },
  ],
};

function teasersForCategory(id: FixCategoryId, categories: FixCategory[]) {
  const fallback = HOME_TEASERS[id] || [];
  const cat = categories.find((c) => c.id === id);
  if (!cat?.series.length) return fallback;
  return cat.series.slice(0, 2).map((s, i) => ({
    label: s.label,
    hint: `${s.brand} models`,
    image: s.image || fallback[i]?.image || fallback[0]?.image || "",
    tint: fallback[i]?.tint || fallback[0]?.tint || "from-[#f0ebff] via-[#f7f4ff] to-[#e8f4ff]",
    series: s.id,
  }));
}

function categoryFromDeviceKey(key: string | null): FixCategoryId {
  const k = (key || "phone").toLowerCase();
  if (k === "macbook" || k.includes("laptop")) return "laptop";
  if (k === "tablet" || k === "ipad") return "ipad";
  if (k.includes("watch")) return "smartwatch";
  return "phone";
}

export function FixPicker({
  devices,
  brands,
}: {
  devices: FixDevice[];
  brands: FixBrand[];
}) {
  const { categories } = useFixCatalog();
  const tabs = FIX_CATEGORY_META.map((c) => ({
    id: c.id,
    key: c.id,
    title: c.label,
    deviceType: c.deviceType,
  }));

  const [active, setActive] = useState<FixCategoryId>("phone");
  const teasers = useMemo(
    () => teasersForCategory(active, categories),
    [active, categories]
  );

  const brandLogos = brands
    .map((b) => ({
      ...b,
      src: getBrandLogoSrc({ key: b.key, title: b.title, meta: b.meta }),
    }))
    .filter((b) => b.src)
    .slice(0, 8);

  // Keep CMS devices available for future — silence unused if empty seed
  void devices;

  return (
    <section className="relative overflow-hidden bg-[#f4f6f5] py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal">
              Start here
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem] sm:leading-none">
              What can we fix for you?
            </h2>
          </div>
          {brandLogos.length > 0 && (
            <div className="flex flex-wrap items-center gap-5 opacity-40">
              {brandLogos.map((b) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={b.id}
                  src={b.src!}
                  alt={b.title}
                  className="h-5 w-auto max-w-[4.5rem] object-contain sm:h-6"
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full gap-1 overflow-x-auto rounded-full bg-white/80 p-1 shadow-[0_8px_28px_rgba(12,31,28,0.05)] ring-1 ring-black/[0.04] sm:w-fit">
          {tabs.map((d) => {
            const on = active === d.key;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActive(d.key)}
                className={`flex min-w-[6.5rem] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:min-w-0 sm:px-5 ${
                  on
                    ? "bg-ink text-white shadow-[0_8px_20px_rgba(12,31,28,0.18)]"
                    : "text-ink-soft/45 hover:text-ink-soft"
                }`}
              >
                <DeviceIcon deviceKey={d.deviceType} size={18} />
                <span>{d.title}</span>
              </button>
            );
          })}
        </div>

        <div
          key={active}
          className="mt-7 grid grid-cols-2 animate-[fxFadeUp_0.45s_ease-out] gap-3 sm:gap-5"
        >
          {teasers.map((m) => (
            <Link
              key={m.label}
              href={`/price?deviceType=${encodeURIComponent(active)}&series=${encodeURIComponent(m.series)}`}
              className={`group relative flex min-h-[220px] overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${m.tint} shadow-[0_10px_36px_rgba(12,31,28,0.07)] ring-1 ring-black/[0.04] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(12,31,28,0.14)] sm:min-h-[320px] sm:rounded-[2rem]`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[78%_center] transition duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/10 sm:via-white/80 sm:to-transparent"
              />
              <div className="relative z-10 flex w-[58%] flex-col justify-between p-5 sm:w-[50%] sm:p-8">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-[1.35rem] font-bold tracking-tight text-ink sm:text-[2rem] sm:leading-none">
                    {m.label}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft/55 sm:mt-3 sm:text-sm">
                    {m.hint}
                  </p>
                </div>
                <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-semibold text-white sm:px-4 sm:py-2 sm:text-xs">
                  Choose model →
                </span>
              </div>
              <span className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm backdrop-blur-md transition duration-300 group-hover:bg-ink group-hover:text-white sm:right-5 sm:top-5 sm:h-11 sm:w-11">
                <IconArrow size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// re-export helper for any external use
export { categoryFromDeviceKey };
