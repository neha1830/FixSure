import Link from "next/link";
import { getStoreSettings } from "@/lib/store";
import { SiteLogo } from "@/components/SiteLogo";
import { BrandMark } from "@/components/BrandMark";
import { HeaderNav } from "@/components/HeaderNav";

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
        <div className="hidden lg:block">
          <HeaderNav variant="desktop" />
        </div>
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
      <div className="lg:hidden">
        <HeaderNav variant="mobile" />
      </div>
    </header>
  );
}
