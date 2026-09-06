import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { getPublishedParts } from "@/lib/parts";
import { PartsCatalogue } from "@/components/PartsCatalogue";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Buy spare parts — ${store.name}`,
    description:
      "Purchase phone, tablet, laptop, and watch parts. Search and filter by device and quality — visit the store to buy.",
  };
}

export default async function PartsPage() {
  const [store, parts] = await Promise.all([
    getStoreSettings(),
    getPublishedParts(),
  ]);

  const catalogueParts = parts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    deviceCategory: p.deviceCategory,
    brand: p.brand,
    sku: p.sku,
    quality: p.quality,
    compatibility: p.compatibility,
    price: p.price,
    imageUrl: p.imageUrl,
    inStock: p.inStock,
  }));

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Parts only
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Buy spare parts
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft/80">
          Screens, batteries, docks, and more for mobiles, tablets, laptops, and
          watches. Prices shown are for the part — ask in store for fitting if
          you need it installed.
        </p>

        {parts.length === 0 ? (
          <p className="mt-12 text-ink-soft/70">
            Parts catalogue coming soon. Call {store.phone} for availability.
          </p>
        ) : (
          <PartsCatalogue
            parts={catalogueParts}
            storePhone={store.phone}
            storeName={store.name}
            storeAddress={store.address}
          />
        )}

        <div className="mt-16 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-8">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold">
            Need it fitted?
          </p>
          <p className="mt-2 text-sm text-ink-soft/75">
            Check an all-in repair estimate (copy → original parts) or book a
            store visit.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/price" className="btn-primary">
              Check repair price
            </Link>
            <Link href="/repair" className="btn-secondary">
              Book repair
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
