import Image from "next/image";
import type { ReactNode } from "react";

type PageBannerProps = {
  eyebrow: string;
  title: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
  accent?: "teal" | "amber";
};

export function PageBanner({
  eyebrow,
  title,
  image,
  imageAlt,
  children,
  accent = "teal",
}: PageBannerProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--line)] shadow-[var(--shadow)]">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1100px"
          className="object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/25 sm:via-white/88 sm:to-transparent" />
      </div>
      <div className="relative min-h-[220px] px-6 py-8 sm:min-h-[260px] sm:px-10 sm:py-12">
        <p
          className={`text-sm font-semibold uppercase tracking-[0.18em] ${
            accent === "amber" ? "text-amber" : "text-teal"
          }`}
        >
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-lg font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {children ? (
          <div className="mt-3 max-w-md text-base leading-relaxed text-ink-soft/80">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
