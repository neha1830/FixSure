import Link from "next/link";
import { IconArrow } from "@/components/Icons";
import { startingPriceFromMeta } from "@/lib/illustrations";

type Service = {
  id: string;
  key: string | null;
  title: string;
  subtitle: string | null;
  meta: string | null;
};

const SPOTLIGHTS: {
  title: string;
  blurb: string;
  href: string;
  bg: string;
  text: string;
  btn: string;
  image: string;
  priceFromKey: string;
}[] = [
  {
    title: "Phone Screen Replacement",
    blurb: "Get store phone repair with a clear ₹range.",
    href: "/price?deviceType=phone&series=iphone&issueCategory=screen",
    bg: "bg-[#dceeff]",
    text: "text-ink",
    btn: "bg-ink text-white",
    image: "/images/fx-spot-phone.png",
    priceFromKey: "screen",
  },
  {
    title: "MacBook Display Repair",
    blurb: "Laptop screens, batteries, and ports — booked in minutes.",
    href: "/price?deviceType=macbook&series=apple&issueCategory=screen",
    bg: "bg-[#2a2118]",
    text: "text-white",
    btn: "bg-white text-ink",
    image: "/images/fx-spot-laptop.png",
    priceFromKey: "screen",
  },
  {
    title: "iPad Battery Replacement",
    blurb: "Drain or swelling fixed with genuine-grade parts.",
    href: "/price?deviceType=ipad&series=ipad&issueCategory=battery",
    bg: "bg-[#c8f0e8]",
    text: "text-ink",
    btn: "bg-ink text-white",
    image: "/images/fx-spot-tablet.png",
    priceFromKey: "battery",
  },
];

export function SpotlightServices({ services }: { services: Service[] }) {
  const priceByKey = Object.fromEntries(
    services.map((s) => [s.key || "", s])
  );

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
              Popular now
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              Services in the spotlight
            </h2>
            <p className="mt-2 text-ink-soft/70">
              Fast, certified repair — clear prices, store visit booking.
            </p>
          </div>
          <Link
            href="/price"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-mist/50 px-4 py-2 text-sm font-semibold text-teal transition hover:border-teal/40 hover:bg-mint/30"
          >
            View all <IconArrow size={14} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {SPOTLIGHTS.map((spot) => {
            const start = startingPriceFromMeta(
              priceByKey[spot.priceFromKey]?.meta
            );
            return (
              <Link
                key={spot.title}
                href={spot.href}
                className={`group relative flex min-h-[340px] flex-col overflow-hidden rounded-[1.85rem] ${spot.bg} ${spot.text} shadow-[0_14px_40px_rgba(12,31,28,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_64px_rgba(12,31,28,0.16)]`}
              >
                <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="max-w-[58%] font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-tight">
                    {spot.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-[54%] text-sm leading-relaxed ${
                      spot.text === "text-white"
                        ? "text-white/75"
                        : "text-ink-soft/75"
                    }`}
                  >
                    {spot.blurb}
                  </p>
                  {start != null && (
                    <p
                      className={`mt-3 text-sm font-bold ${
                        spot.text === "text-white" ? "text-mint" : "text-teal"
                      }`}
                    >
                      Starting at ₹{start.toLocaleString("en-IN")}
                    </p>
                  )}
                  <span
                    className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm ${spot.btn} transition group-hover:scale-[1.04]`}
                  >
                    Book now <IconArrow size={14} />
                  </span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spot.image}
                  alt=""
                  className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[60%] object-cover object-left transition duration-500 group-hover:scale-105"
                  style={{
                    maskImage:
                      "linear-gradient(100deg, transparent 0%, black 32%)",
                    WebkitMaskImage:
                      "linear-gradient(100deg, transparent 0%, black 32%)",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
