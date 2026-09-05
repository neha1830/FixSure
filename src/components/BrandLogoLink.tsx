"use client";

import { useState } from "react";

const TILE_TINTS = [
  "bg-[#FFF4E8]",
  "bg-[#EAF4FF]",
  "bg-[#EEFBF3]",
  "bg-[#FFF0F3]",
  "bg-[#F5F0FF]",
  "bg-[#FFF8E7]",
  "bg-[#E8FBFF]",
  "bg-[#F0F4FF]",
];

export function BrandLogoLink({
  href,
  src,
  title,
  index = 0,
}: {
  href: string;
  src: string;
  title: string;
  index?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <a
      href={href}
      title={title}
      aria-label={title}
      className={`brand-logo-tile flex h-24 items-center justify-center rounded-2xl border border-[var(--line)] px-5 transition hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-[var(--shadow)] ${TILE_TINTS[index % TILE_TINTS.length]}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="max-h-10 max-w-[8rem] object-contain"
        onError={() => setFailed(true)}
      />
    </a>
  );
}
