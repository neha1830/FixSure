import Link from "next/link";
import { getStoreSettings } from "@/lib/store";

export async function Footer() {
  const store = await getStoreSettings();

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-ink text-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="brand-mark text-3xl font-bold text-white">
            Fix<span className="text-mint">Sure</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-mint/80">
            Transparent phone repair and fair buyback — built so you always
            know what happens next.
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
            <Link href="/troubleshoot" className="hover:text-mint">
              Free troubleshooting
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
