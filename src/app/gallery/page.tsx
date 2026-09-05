import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Before & after gallery — FixSure",
  description:
    "Real repair photos published only with customer consent.",
};

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    where: { published: true, consentGiven: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Real work
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Before &amp; after
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft/80">
          Every set below is published with the customer&apos;s written consent.
          We never share unlocked screens with personal photos or messages.
        </p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-10 text-center">
            <p className="text-ink-soft/70">
              Gallery coming soon — we&apos;ll add consented repair photos here.
            </p>
            <Link href="/repair" className="btn-primary mt-6 inline-flex">
              Book a repair
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[var(--shadow)]"
              >
                <div className="grid md:grid-cols-2">
                  <figure className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.beforeUrl}
                      alt={`Before: ${item.device}`}
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                    <figcaption className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Before
                    </figcaption>
                  </figure>
                  <figure className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.afterUrl}
                      alt={`After: ${item.device}`}
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                    <figcaption className="absolute left-4 top-4 rounded-full bg-teal px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      After
                    </figcaption>
                  </figure>
                </div>
                <div className="px-6 py-5">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft/70">
                    {item.device}
                    {item.repairType ? ` · ${item.repairType}` : ""}
                  </p>
                  {item.caption && (
                    <p className="mt-2 text-sm text-ink-soft/80">
                      {item.caption}
                    </p>
                  )}
                  <p className="mt-3 text-xs font-medium text-teal">
                    Published with customer consent
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
