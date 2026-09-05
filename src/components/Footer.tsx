import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { SiteLogo } from "@/components/SiteLogo";

export async function Footer() {
  const store = await getStoreSettings();

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-ink text-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <Link href="/" aria-label={store.name} className="inline-flex">
            <SiteLogo size="lg" onDark />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mint/80">
            Transparent device repair, fair buyback, and live tracking so you
            always know what happens next.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint/70">
            Visit us
          </p>
          <p className="mt-3 text-sm leading-relaxed">{store.address}</p>
          <p className="mt-2 text-sm">{store.hours}</p>
          <p className="mt-2 text-sm font-semibold text-mint">{store.phone}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-mint/70">
            Quick links
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/price" className="hover:text-mint">
              Check price
            </Link>
            <Link href="/troubleshoot" className="hover:text-mint">
              Free troubleshooting
            </Link>
            <Link href="/repair" className="hover:text-mint">
              Book repair
            </Link>
            <Link href="/gallery" className="hover:text-mint">
              Before &amp; after gallery
            </Link>
            <Link href="/privacy" className="hover:text-mint">
              Privacy pledge
            </Link>
            <Link href="/track" className="hover:text-mint">
              Track your repair
            </Link>
            <Link href="/sell" className="hover:text-mint">
              Sell your phone
            </Link>
            <Link href="/reviews" className="hover:text-mint">
              Reviews
            </Link>
            <Link href="/contact" className="hover:text-mint">
              Contact
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-mint/50">
        © {new Date().getFullYear()} {store.name}. Honest repairs. Clear
        updates.
      </div>
    </footer>
  );
}
