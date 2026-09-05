"use client";

import { FormEvent, useMemo, useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { DeviceIcon } from "@/components/Icons";

type ContentRow = {
  id: string;
  key: string | null;
  title: string;
  subtitle: string | null;
};

function PriceForm() {
  const params = useSearchParams();
  const [devices, setDevices] = useState<ContentRow[]>([]);
  const [brands, setBrands] = useState<ContentRow[]>([]);
  const [services, setServices] = useState<ContentRow[]>([]);
  const [warrantyDays, setWarrantyDays] = useState(90);
  const [deviceType, setDeviceType] = useState(
    params.get("deviceType") || "phone"
  );
  const [brand, setBrand] = useState(params.get("brand") || "Apple");
  const [issueCategory, setIssueCategory] = useState(
    params.get("issueCategory") || "screen"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    estimatedCharge: number;
    estimateValidUntil: string;
    priceLockDays: number;
    warrantyDays: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.byType?.device) setDevices(data.byType.device);
        if (data.byType?.brand) setBrands(data.byType.brand);
        if (data.byType?.service) setServices(data.byType.service);
        if (data.store?.warrantyDays) setWarrantyDays(data.store.warrantyDays);
        if (!params.get("brand") && data.byType?.brand?.[0]) {
          setBrand(data.byType.brand[0].title);
        }
        if (!params.get("issueCategory") && data.byType?.service?.[0]?.key) {
          setIssueCategory(data.byType.service[0].key);
        }
        if (!params.get("deviceType") && data.byType?.device?.[0]?.key) {
          setDeviceType(data.byType.device[0].key);
        }
      })
      .catch(() => {});
  }, [params]);

  const bookHref = useMemo(() => {
    const q = new URLSearchParams({
      deviceType,
      brand,
      issueCategory,
    });
    return `/repair?${q.toString()}`;
  }, [deviceType, brand, issueCategory]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType,
          brand,
          issueCategory,
          serviceMode: "STORE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not get price");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="mt-3 text-ink-soft/80">
        Instant estimate with no hidden fees. Lock it in when you book a store
        visit — up to {warrantyDays}-day warranty on eligible repairs.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-10 space-y-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
      >
        <div>
          <p className="field-label mb-3">Device type</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDeviceType(d.key || d.title)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  deviceType === d.key
                    ? "border-teal bg-mint/40"
                    : "border-[var(--line)] bg-white hover:border-teal/40"
                }`}
              >
                <span className="icon-tile !h-10 !w-10">
                  <DeviceIcon deviceKey={d.key} size={20} />
                </span>
                <p className="mt-3 font-semibold">{d.title}</p>
                {d.subtitle && (
                  <p className="text-xs text-ink-soft/65">{d.subtitle}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Brand</label>
            <select
              className="field"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {brands.map((b) => (
                <option key={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Issue</label>
            <select
              className="field"
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.key || s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Calculating…" : "Get estimate"}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal">
            Your estimate
          </p>
          <p className="mt-2 text-4xl font-bold text-teal">
            ₹{result.estimatedCharge.toLocaleString("en-IN")}
          </p>
          <PriceLockBadge
            className="mt-4"
            validUntil={result.estimateValidUntil}
            amountLabel="repair estimate"
            lockDays={result.priceLockDays}
          />
          <p className="mt-4 text-sm text-ink-soft/75">
            Final amount after diagnosis. Eligible jobs include up to{" "}
            {result.warrantyDays}-day warranty.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={bookHref} className="btn-primary">
              Book store visit
            </Link>
            <Link href="/troubleshoot" className="btn-secondary">
              Try free DIY first
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function PricePage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Step 1
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Check price
        </h1>
        <Suspense fallback={<p className="mt-10">Loading…</p>}>
          <PriceForm />
        </Suspense>
      </div>
    </div>
  );
}
