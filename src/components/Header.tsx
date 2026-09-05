import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { SiteLogo } from "@/components/SiteLogo";
import { BrandMark } from "@/components/BrandMark";

const links = [
  { href: "/price", label: "Check price" },
  { href: "/troubleshoot", label: "Troubleshoot" },
  { href: "/repair", label: "Repair" },
  { href: "/sell", label: "Sell phone" },
  { href: "/gallery", label: "Gallery" },
  { href: "/track", label: "Track" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const store = await getStoreSettings();

  return (
    <header className="relative z-20 border-b border-[var(--line)] bg-[rgba(251,252,251,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label={store.name}
        >
          <SiteLogo size="sm" className="shrink-0" />
          <BrandMark
            name={store.name}
            className="truncate text-xl font-bold text-ink sm:text-2xl"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-teal"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${store.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-semibold text-teal sm:block"
          >
            {store.phone}
          </a>
          <Link href="/repair" className="btn-primary !px-4 !py-2 text-sm">
            Book repair
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-[var(--line)] px-5 py-2 text-sm font-medium text-ink-soft lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
