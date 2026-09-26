"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primaryLinks = [
  { href: "/price", label: "Check price" },
  { href: "/parts", label: "Buy parts" },
  { href: "/troubleshoot", label: "Troubleshoot" },
  { href: "/repair", label: "Repair" },
  { href: "/sell", label: "Sell phone" },
  { href: "/track", label: "Track" },
];

const moreLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean, extra = "") {
  return `relative whitespace-nowrap transition-colors ${
    active
      ? "font-semibold text-teal"
      : "hover:text-teal"
  } ${extra}`;
}

function MoreMenu({
  align = "right",
  pathname,
}: {
  align?: "left" | "right";
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const childActive = moreLinks.some((l) => isActivePath(pathname, l.href));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-teal ${
          open || childActive ? "font-semibold text-teal" : ""
        }`}
      >
        More
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-[calc(100%+0.5rem)] z-30 min-w-[10.5rem] rounded-xl border border-[var(--line)] bg-white py-1.5 shadow-[var(--shadow)] ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {moreLinks.map((l) => {
            const on = isActivePath(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                aria-current={on ? "page" : undefined}
                className={`block px-3.5 py-2 text-sm transition-colors hover:bg-mist hover:text-teal ${
                  on ? "bg-mint/40 font-semibold text-teal" : "text-ink-soft"
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HeaderNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname() || "";

  if (variant === "desktop") {
    return (
      <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
        {primaryLinks.map((l) => {
          const on = isActivePath(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={on ? "page" : undefined}
              className={navLinkClass(on)}
            >
              {l.label}
              {on && (
                <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-teal" />
              )}
            </Link>
          );
        })}
        <MoreMenu pathname={pathname} />
      </nav>
    );
  }

  return (
    <nav className="flex gap-4 overflow-x-auto border-t border-[var(--line)] px-5 py-2 text-sm font-medium text-ink-soft">
      {primaryLinks.map((l) => {
        const on = isActivePath(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={navLinkClass(on)}
          >
            {l.label}
          </Link>
        );
      })}
      <MoreMenu align="left" pathname={pathname} />
    </nav>
  );
}
