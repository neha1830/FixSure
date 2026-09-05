import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { prisma } from "@/lib/db";
import { getContentByType } from "@/lib/site-content";
import { BrandMark } from "@/components/BrandMark";
import { SiteLogo } from "@/components/SiteLogo";
import { BrandLogoLink } from "@/components/BrandLogoLink";
import { getBrandLogoSrc } from "@/lib/brand-logos";
import {
  DeviceIcon,
  IconArrow,
  IconCheck,
  IconShield,
  IconStar,
  ProcessIcon,
  ServiceIcon,
  TrustIcon,
} from "@/components/Icons";

const stages = [
  "Request",
  "Received",
  "Diagnosing",
  "In progress",
  "Ready",
  "Done",
];

export default async function HomePage() {
  const store = await getStoreSettings();
  const [
    devices,
    brands,
    process,
    services,
    trust,
    why,
    testimonials,
    faqs,
    galleryPreview,
    customerReviews,
  ] = await Promise.all([
    getContentByType("device"),
    getContentByType("brand"),
    getContentByType("process"),
    getContentByType("service"),
    getContentByType("trust"),
    getContentByType("why"),
    getContentByType("testimonial"),
    getContentByType("faq"),
    prisma.galleryItem.findMany({
      where: { published: true, consentGiven: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.customerReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="relative overflow-hidden">
      {/* Full-bleed hero */}
      <section className="relative min-h-[92vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-repair.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:justify-center sm:pb-24">
          <div className="reveal flex flex-wrap items-center gap-3 sm:gap-4">
            <SiteLogo size="lg" onDark />
            <BrandMark
              name={store.name}
              className="text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl"
              accentClassName="text-mint"
            />
          </div>
          <h1 className="reveal reveal-delay-1 mt-6 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-white/95 sm:text-3xl">
            {store.heroHeadline}
          </h1>
          <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            {store.heroSubtext}
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href={store.ctaPrimaryHref}
              className="btn-primary !bg-mint !text-teal-deep !shadow-none"
            >
              {store.ctaPrimaryLabel}
              <IconArrow size={18} />
            </Link>
            <Link
              href={store.ctaSecondaryHref}
              className="btn-secondary !border-white/35 !text-white hover:!bg-white/10"
            >
              {store.ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* Live track strip */}
      <section className="border-b border-[var(--line)] bg-ink py-12 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint/70">
              Live repair path
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">
              You always see where your device is.
            </p>
            <Link
              href="/track"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mint"
            >
              Track a repair <IconArrow size={16} />
            </Link>
          </div>
          <ol className="stage-rail space-y-3 pl-1">
            {stages.map((s, i) => (
              <li key={s} className="relative flex items-center gap-3 pl-1">
                <span
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i < 3
                      ? "trust-pulse bg-mint text-teal-deep"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-white/85">{s}</span>
                {i === 2 && (
                  <span className="ml-auto text-xs text-mint">current</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {devices.length > 0 && (
        <section className="section-photo relative py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/devices-banner.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              What we fix
            </p>
            <p className="mt-2 max-w-xl text-white/75">
              Phones, tablets, laptops, and watches — transparent store repairs.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {devices.map((d) => (
                <Link
                  key={d.id}
                  href={`/price?deviceType=${d.key || ""}`}
                  className="group rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition hover:bg-white/20"
                >
                  <span className="icon-tile !bg-white/90">
                    <DeviceIcon deviceKey={d.key} size={22} />
                  </span>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                    {d.title}
                  </p>
                  {d.subtitle && (
                    <p className="mt-2 text-sm text-white/70">{d.subtitle}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="atmosphere border-y border-[var(--line)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Explore top brands
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {brands.map((b) => {
                const src = getBrandLogoSrc({
                  key: b.key,
                  title: b.title,
                  meta: b.meta,
                });
                if (!src) return null;
                return (
                  <BrandLogoLink
                    key={b.id}
                    href={`/price?brand=${encodeURIComponent(b.title)}`}
                    src={src}
                    title={b.title}
                    index={brands.indexOf(b)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {process.length > 0 && (
        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="accent-line mb-4" />
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Our process
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {process.map((s, i) => (
                <div key={s.id} className="relative">
                  <span className="icon-tile icon-tile-lg">
                    <ProcessIcon index={i} size={26} />
                  </span>
                  <p className="mt-5 text-sm font-bold text-teal">
                    Step {i + 1}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                    {s.title}
                  </h2>
                  {s.body && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                      {s.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Link href={store.ctaPrimaryHref} className="btn-primary mt-10">
              {store.ctaPrimaryLabel}
              <IconArrow size={18} />
            </Link>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="atmosphere border-y border-[var(--line)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Smart solutions
            </p>
            <p className="mt-2 max-w-xl text-ink-soft/75">
              Common repairs with clear estimates and genuine-parts focus.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services
                .filter((s) => s.key !== "other")
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/price?issueCategory=${s.key || ""}`}
                    className="group flex gap-4 rounded-2xl border border-[var(--line)] bg-white/90 p-5 transition hover:border-teal/40 hover:shadow-[var(--shadow)]"
                  >
                    <span className="icon-tile">
                      <ServiceIcon serviceKey={s.key} size={22} />
                    </span>
                    <div>
                      <p className="font-semibold group-hover:text-teal">
                        {s.title}
                      </p>
                      {s.subtitle && (
                        <p className="mt-1 text-sm text-ink-soft/70">
                          {s.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {trust.length > 0 && (
        <section className="bg-white/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
              Trust is the product
            </p>
            <p className="mt-3 max-w-2xl text-ink-soft/80">{store.trustIntro}</p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((p, i) => (
                <div key={p.id}>
                  <span className="icon-tile">
                    <TrustIcon index={i} size={22} />
                  </span>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">
                    {p.title}
                  </h2>
                  {p.body && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                      {p.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {why.length > 0 && (
        <section className="atmosphere border-y border-[var(--line)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Driven by quality
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {why.map((w) => (
                <div key={w.id} className="flex gap-3">
                  <span className="mt-0.5 text-teal">
                    <IconCheck size={22} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{w.title}</p>
                    {w.body && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                        {w.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-teal-deep to-teal p-8 text-white sm:p-10">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-mint/20 blur-2xl" />
          <IconShield size={36} className="text-mint" />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
            Repair with clarity
          </h2>
          <p className="mt-3 text-white/80">
            Free DIY steps, then book a store visit with a{" "}
            {store.priceLockDays}-day locked estimate and live tracking.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/troubleshoot"
              className="btn-primary !bg-mint !text-teal-deep !shadow-none"
            >
              Troubleshoot free
            </Link>
            <Link
              href="/repair"
              className="btn-secondary !border-white/30 !text-white"
            >
              Book repair
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-amber-soft to-[#e8c98a] p-8 sm:p-10">
          <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-white/40 blur-2xl" />
          <IconStar size={36} className="text-amber" />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
            Sell with a real estimate
          </h2>
          <p className="mt-3 text-ink-soft/80">
            Share condition and storage, get an instant range locked for{" "}
            {store.priceLockDays} days, then walk in for inspection.
          </p>
          <Link href="/sell" className="btn-primary mt-6">
            Get sell estimate
          </Link>
        </div>
      </section>

      {(customerReviews.length > 0 || testimonials.length > 0) && (
        <section className="border-y border-[var(--line)] bg-white/50 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
                Customers said
              </p>
              <Link href="/reviews" className="btn-secondary !py-2 text-sm">
                Write a review
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(customerReviews.length > 0
                ? customerReviews.map((t) => ({
                    id: t.id,
                    title: t.name,
                    subtitle: t.device,
                    body: t.body,
                    rating: t.rating,
                  }))
                : testimonials.map((t) => ({
                    id: t.id,
                    title: t.title,
                    subtitle: t.subtitle,
                    body: t.body,
                    rating: 5,
                  }))
              ).map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
                >
                  <p className="flex gap-0.5 text-amber">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <IconStar key={i} size={16} />
                    ))}
                  </p>
                  {t.body && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft/80">
                      “{t.body}”
                    </p>
                  )}
                  <p className="mt-4 text-sm font-semibold">
                    {t.title}{" "}
                    {t.subtitle && (
                      <span className="font-normal text-ink-soft/60">
                        · {t.subtitle}
                      </span>
                    )}
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="atmosphere py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
                Before &amp; after
              </p>
              <p className="mt-2 max-w-xl text-ink-soft/75">
                Real repairs, published only with customer consent.
              </p>
            </div>
            <Link href="/gallery" className="btn-secondary !py-2 text-sm">
              View gallery
            </Link>
          </div>
          {galleryPreview.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {galleryPreview.map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]"
                >
                  <div className="grid grid-cols-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.beforeUrl}
                      alt=""
                      className="aspect-square object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.afterUrl}
                      alt=""
                      className="aspect-square object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold group-hover:text-teal">
                      {item.title}
                    </p>
                    <p className="text-sm text-ink-soft/60">{item.device}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink-soft/60">
              Consented repair photos will appear here.{" "}
              <Link href="/privacy" className="font-semibold text-teal">
                Read our privacy pledge
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="border-y border-[var(--line)] bg-white/70 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              You ask? We answer
            </p>
            <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {faqs.map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {f.title}
                      <span className="text-teal transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  {f.body && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft/75">
                      {f.body}
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-[var(--line)] bg-fog/80 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex gap-4">
            <span className="icon-tile icon-tile-lg">
              <IconShield size={26} />
            </span>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                {store.privacyBlurb.split(".")[0]}.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-soft/75">
                {store.privacyBlurb}
              </p>
            </div>
          </div>
          <Link href="/privacy" className="btn-primary shrink-0">
            Privacy pledge
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-ink px-8 py-10 text-white sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint/70">
            Store &amp; contact
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">
            {store.name}
          </p>
          <p className="mt-2 max-w-xl text-mint/80">{store.address}</p>
          <p className="mt-1 text-sm text-mint/60">{store.hours}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${store.phone.replace(/\s/g, "")}`}
              className="btn-primary !bg-mint !text-teal-deep !shadow-none"
            >
              Call {store.phone}
            </a>
            <Link
              href="/contact"
              className="btn-secondary !border-white/25 !text-white"
            >
              Contact form
            </Link>
            <Link
              href="/track"
              className="btn-secondary !border-white/25 !text-white"
            >
              Track a repair
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
