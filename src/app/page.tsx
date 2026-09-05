import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { prisma } from "@/lib/db";
import { PRICE_LOCK_DAYS } from "@/lib/pricing";

const trustPoints = [
  {
    title: "Free DIY first",
    text: "We share clear troubleshooting steps before asking you to visit — no pressure sales.",
  },
  {
    title: `${PRICE_LOCK_DAYS}-day price lock`,
    text: `Online estimates stay valid for ${PRICE_LOCK_DAYS} days when you visit — no silent price jumps.`,
  },
  {
    title: "Privacy first",
    text: "We never access photos without permission. No sign-out or factory reset required.",
  },
  {
    title: "Consented gallery",
    text: "Before/after repair photos are published only with the customer’s written consent.",
  },
];

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
  const galleryPreview = await prisma.galleryItem.findMany({
    where: { published: true, consentGiven: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  return (
    <div className="atmosphere relative overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0 h-[90vh]" />

      <section className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="brand-mark reveal text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-8xl">
            Fix<span className="text-teal">Sure</span>
          </p>
          <h1 className="reveal reveal-delay-1 mt-6 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-ink-soft sm:text-3xl">
            Phone trouble? Know the fix — and every step after.
          </h1>
          <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base leading-relaxed text-ink-soft/80 sm:text-lg">
            Troubleshoot for free, book a transparent repair with live WhatsApp
            updates, or get a fair sell estimate before you visit the store.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/troubleshoot" className="btn-primary">
              Start troubleshooting
            </Link>
            <Link href="/sell" className="btn-secondary">
              Sell your phone
            </Link>
          </div>
        </div>

        <div className="relative reveal reveal-delay-2">
          <div className="float-slow relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-teal-deep via-teal to-[#1a5c52] p-8 text-white shadow-[var(--shadow)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mint/20 blur-2xl" />
            <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-amber-soft/30 blur-2xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">
              Live repair path
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">
              You always see where your phone is.
            </p>
            <ol className="mt-8 space-y-3">
              {stages.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm backdrop-blur-sm"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i < 3
                        ? "trust-pulse bg-mint text-teal-deep"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s}
                  {i === 2 && (
                    <span className="ml-auto text-xs text-mint">current</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
            Trust is the product
          </p>
          <p className="mt-3 max-w-2xl text-ink-soft/80">
            FixSure is built so customers never wonder what happens behind the
            counter.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((p) => (
              <div key={p.title}>
                <div className="mb-3 h-1 w-10 rounded-full bg-teal" />
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2">
        <div className="rounded-[1.75rem] bg-fog p-8 sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
            Repair with clarity
          </h2>
          <p className="mt-3 text-ink-soft/80">
            Fill device details, try free steps, then book a visit with a{" "}
            {PRICE_LOCK_DAYS}-day locked estimate and our store pin.
          </p>
          <Link href="/repair" className="btn-primary mt-6">
            Submit repair request
          </Link>
        </div>
        <div className="rounded-[1.75rem] bg-amber-soft/60 p-8 sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
            Sell with a real estimate
          </h2>
          <p className="mt-3 text-ink-soft/80">
            Share condition and storage, get an instant range locked for{" "}
            {PRICE_LOCK_DAYS} days, then walk in for inspection.
          </p>
          <Link href="/sell" className="btn-primary mt-6">
            Get sell estimate
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/50 py-20">
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
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
                >
                  <div className="grid grid-cols-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.beforeUrl}
                      alt=""
                      className="aspect-square object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.afterUrl}
                      alt=""
                      className="aspect-square object-cover"
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

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-fog/80 p-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              We never access photos without permission
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-soft/75">
              You don&apos;t need to sign out or factory-reset. Gallery photos
              need your written consent — always.
            </p>
          </div>
          <Link href="/privacy" className="btn-primary mt-6 shrink-0 sm:mt-0">
            Privacy pledge
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-ink px-8 py-10 text-white sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint/70">
            Store
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
            <Link href="/track" className="btn-secondary !border-white/25 !text-white">
              Track a repair
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
