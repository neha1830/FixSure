import Link from "next/link";
import Image from "next/image";
import { getStoreSettings } from "@/lib/store";
import { getAllActiveContent } from "@/lib/site-content";
import { getApprovedReviews, getGalleryPreview } from "@/lib/public-data";
import { BrandMark } from "@/components/BrandMark";
import { SiteLogo } from "@/components/SiteLogo";
import { BrandLogoLink } from "@/components/BrandLogoLink";
import { getBrandLogoSrc } from "@/lib/brand-logos";
import { FixPicker } from "@/components/FixPicker";
import { SpotlightServices } from "@/components/SpotlightServices";
import { PROMISE_CARTOONS } from "@/lib/fix-catalog";
import {
  IconArrow,
  IconShield,
  IconStar,
  ProcessIcon,
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
  const [store, content, galleryPreview, customerReviews] = await Promise.all([
    getStoreSettings(),
    getAllActiveContent(),
    getGalleryPreview(),
    getApprovedReviews(6),
  ]);

  const devices = content.filter((c) => c.type === "device");
  const brands = content.filter((c) => c.type === "brand");
  const process = content.filter((c) => c.type === "process");
  const services = content.filter(
    (c) => c.type === "service" && c.key !== "other"
  );
  const trust = content.filter((c) => c.type === "trust");
  const why = content.filter((c) => c.type === "why");
  const testimonials = content.filter((c) => c.type === "testimonial");
  const faqs = content.filter((c) => c.type === "faq");

  const reviewCards =
    customerReviews.length > 0
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
        }));

  return (
    <div className="relative overflow-hidden">
      {/* Hero — big photo, one clear job */}
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src="/images/hero-store.jpg"
          alt="Device repair at the store"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:justify-center sm:pb-20">
          <div className="reveal flex flex-wrap items-center gap-3">
            <SiteLogo size="lg" onDark />
            <BrandMark
              name={store.name}
              className="text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl"
              accentClassName="text-mint"
            />
          </div>
          <h1 className="reveal reveal-delay-1 mt-6 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white sm:text-5xl">
            {store.heroHeadline}
          </h1>
          <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            {store.heroSubtext}
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href={store.ctaPrimaryHref}
              className="btn-primary !bg-mint !px-7 !py-3.5 !text-base !text-teal-deep !shadow-none"
            >
              {store.ctaPrimaryLabel}
              <IconArrow size={18} />
            </Link>
            <Link
              href={store.ctaSecondaryHref}
              className="btn-secondary !border-white/40 !px-7 !py-3.5 !text-base !text-white hover:!bg-white/10"
            >
              {store.ctaSecondaryLabel}
            </Link>
          </div>
          <p className="reveal reveal-delay-3 mt-5 text-sm text-white/65">
            Up to {store.warrantyDays}-day warranty · {store.priceLockDays}-day
            price lock · Track anytime
          </p>
        </div>
      </section>

      <FixPicker devices={devices} brands={brands} />

      {services.length > 0 && <SpotlightServices services={services} />}

      {/* Brands — quick jump */}
      {brands.length > 0 && (
        <section className="border-y border-[var(--line)] bg-white py-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
                Or jump by brand
              </h2>
              <Link
                href="/price"
                className="text-sm font-semibold text-teal hover:underline"
              >
                All prices →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {brands.map((b, i) => {
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
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Promise / trust — cartoon cards side by side */}
      {(trust.length > 0 || why.length > 0) && (
        <section className="bg-[#f7faf8] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              Our promise
            </h2>
            <p className="mt-2 max-w-2xl text-ink-soft/75">
              {store.trustIntro ||
                `Warranty up to ${store.warrantyDays} days, trained technicians, and clear pricing.`}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {(trust.length > 0 ? trust : why.slice(0, 4)).map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[0_12px_36px_rgba(12,31,28,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(12,31,28,0.1)]"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-mist to-fog/60 p-4 sm:p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        PROMISE_CARTOONS[i % PROMISE_CARTOONS.length]
                      }
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="font-[family-name:var(--font-display)] text-base font-bold leading-snug sm:text-lg">
                      {p.title}
                    </p>
                    {p.body && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-soft/70 sm:text-sm">
                        {p.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works — short */}
      {process.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              How it works
            </h2>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {process.map((s, i) => (
                <div
                  key={s.id}
                  className="rounded-3xl border border-[var(--line)] bg-mist/50 p-6"
                >
                  <span className="icon-tile icon-tile-lg">
                    <ProcessIcon index={i} size={26} />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-teal">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                    {s.title}
                  </h3>
                  {s.body && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                      {s.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/price" className="btn-primary">
                Check price <IconArrow size={18} />
              </Link>
              <Link href="/track" className="btn-secondary">
                Track a repair
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Live path — compact */}
      <section className="border-y border-[var(--line)] bg-ink py-12 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint/70">
                Live status
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
                Always know where your device is
              </h2>
            </div>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 text-sm font-semibold text-mint"
            >
              Track with mobile number <IconArrow size={16} />
            </Link>
          </div>
          <ol className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {stages.map((s, i) => (
              <li
                key={s}
                className={`flex min-w-[7.5rem] flex-col rounded-2xl border px-3 py-3 ${
                  i < 3
                    ? "border-mint/40 bg-mint/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-xs font-bold text-mint">{i + 1}</span>
                <span className="mt-1 text-sm text-white/90">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Dual CTA: troubleshoot + sell */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 py-16 sm:grid-cols-2">
        <div className="relative isolate min-h-[300px] overflow-hidden rounded-[1.75rem] border border-[var(--line)] shadow-[var(--shadow)]">
          <Image
            src="/images/banners/banner-troubleshoot.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06352e] via-[#06352e]/88 to-[#06352e]/20" />
          <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-end p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">
              Free first
            </p>
            <h2 className="mt-2 max-w-xs text-2xl font-bold leading-snug tracking-normal text-white sm:text-[1.75rem]">
              Try free DIY first
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
              Clear troubleshooting steps before you visit — then book with a
              locked estimate.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/troubleshoot"
                className="btn-primary !bg-mint !text-teal-deep !shadow-none"
              >
                Troubleshoot
              </Link>
              <Link
                href="/repair"
                className="btn-secondary !border-white/30 !text-white"
              >
                Book repair
              </Link>
            </div>
          </div>
        </div>
        <div className="relative isolate min-h-[300px] overflow-hidden rounded-[1.75rem] border border-[var(--line)] shadow-[var(--shadow)]">
          <Image
            src="/images/banners/banner-sell.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover object-[75%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3d2a12] via-[#3d2a12]/86 to-[#3d2a12]/18" />
          <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-end p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-soft">
              Fair buyback
            </p>
            <h2 className="mt-2 max-w-xs text-2xl font-bold leading-snug tracking-normal text-white sm:text-[1.75rem]">
              Sell your phone
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
              Instant sell estimate, locked for {store.priceLockDays} days —
              then walk in for inspection.
            </p>
            <Link href="/sell" className="btn-primary mt-5">
              Get sell estimate
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviewCards.length > 0 && (
        <section className="border-y border-[var(--line)] bg-mist/40 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                  Happy customers
                </h2>
                <p className="mt-2 text-sm text-ink-soft/70">
                  Real stories from real repairs.
                </p>
              </div>
              <Link href="/reviews" className="btn-secondary !py-2.5 text-sm">
                Write a review
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {reviewCards.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
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
                    {t.title}
                    {t.subtitle && (
                      <span className="font-normal text-ink-soft/60">
                        {" "}
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

      {/* Gallery */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                Before &amp; after
              </h2>
              <p className="mt-2 text-sm text-ink-soft/70">
                Real repairs — published only with consent.
              </p>
            </div>
            <Link href="/gallery" className="btn-secondary !py-2.5 text-sm">
              View gallery
            </Link>
          </div>
          {galleryPreview.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {galleryPreview.map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow)]"
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
                Privacy pledge
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="border-y border-[var(--line)] bg-mist/30 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Questions? Answers.
            </h2>
            <div className="mt-8 divide-y divide-[var(--line)] rounded-3xl border border-[var(--line)] bg-white px-5">
              {faqs.map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="cursor-pointer list-none font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
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

      {/* Parts + privacy + contact strip */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[var(--line)] bg-fog/70 p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Need parts only?
            </h2>
            <p className="mt-2 text-sm text-ink-soft/75">
              Browse screens, batteries, and more — buy at the store.
            </p>
            <Link href="/parts" className="btn-primary mt-6">
              Buy parts
            </Link>
          </div>
          <div className="flex flex-col justify-between rounded-[1.75rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
            <div className="flex gap-4">
              <span className="icon-tile icon-tile-lg">
                <IconShield size={26} />
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                  Your data stays yours
                </h2>
                <p className="mt-2 text-sm text-ink-soft/75">
                  {store.privacyBlurb}
                </p>
              </div>
            </div>
            <Link href="/privacy" className="btn-secondary mt-6 self-start">
              Privacy pledge
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-ink px-8 py-10 text-white sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint/70">
            Visit us
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            {store.name}
          </h2>
          <p className="mt-3 max-w-xl text-white/75">{store.address}</p>
          <p className="mt-1 text-white/75">{store.hours}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${store.phone.replace(/\s/g, "")}`}
              className="btn-primary !bg-mint !text-teal-deep !shadow-none"
            >
              Call {store.phone}
            </a>
            <Link
              href="/contact"
              className="btn-secondary !border-white/30 !text-white"
            >
              Contact
            </Link>
            <Link
              href="/repair"
              className="btn-secondary !border-white/30 !text-white"
            >
              Book repair
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
