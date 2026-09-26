"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  BATTERY_HEALTH_OPTIONS,
  ISSUE_CATEGORIES,
  STORAGE_OPTIONS,
  TroubleshootStep,
  isAppleBrand,
} from "@/lib/troubleshooting-constants";
import { brandsForDeviceType, sellPhoneModelsForBrand } from "@/lib/fix-catalog";
import { useFixCatalog } from "@/lib/use-fix-catalog";
import { PageBanner } from "@/components/PageBanner";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { getEstimateValidUntil } from "@/lib/pricing";

type StoreInfo = {
  name: string;
  address: string;
  phone: string;
  hours: string;
};

type Category = { value: string; label: string };

export default function TroubleshootPage() {
  const { categories: catalog } = useFixCatalog();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<TroubleshootStep[] | null>(null);
  const [estimateMin, setEstimateMin] = useState<number | null>(null);
  const [estimateMax, setEstimateMax] = useState<number | null>(null);
  const [estimateValidUntil, setEstimateValidUntil] = useState<string | null>(
    null
  );
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([...ISSUE_CATEGORIES]);
  const [form, setForm] = useState({
    brand: "Apple",
    model: "",
    storage: "128GB",
    batteryHealth: "",
    issueCategory: "screen",
    issueDescription: "",
  });

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) {
          setCategories(data.categories);
          setForm((f) =>
            data.categories.some(
              (c: Category) => c.value === f.issueCategory
            )
              ? f
              : { ...f, issueCategory: data.categories[0].value }
          );
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSteps(data.steps);
      setEstimateMin(data.estimatedChargeMin ?? data.estimatedCharge);
      setEstimateMax(data.estimatedChargeMax ?? data.estimatedCharge);
      setEstimateValidUntil(
        data.estimateValidUntil || getEstimateValidUntil().toISOString()
      );
      setStore(data.store);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const repairQuery = new URLSearchParams({
    brand: form.brand,
    model: form.model,
    storage: form.storage,
    batteryHealth: form.batteryHealth,
    issueCategory: form.issueCategory,
    issueDescription: form.issueDescription,
    troubleshootTried: "1",
  }).toString();

  const phoneBrands = brandsForDeviceType("phone", catalog);
  const phoneModels = sellPhoneModelsForBrand(form.brand, catalog);

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <PageBanner
          eyebrow="Free first"
          title="Troubleshoot your phone"
          image="/images/banners/banner-troubleshoot.png"
          imageAlt="Phone and tools for DIY troubleshooting"
        >
          Tell us about the device and issue. We&apos;ll give practical steps —
          if it still fails, book a repair with an estimate and store details.
        </PageBanner>

        {!steps ? (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Brand *</label>
                <select
                  className="field"
                  value={form.brand}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      brand: e.target.value,
                      model: "",
                      batteryHealth: isAppleBrand(e.target.value)
                        ? form.batteryHealth
                        : "",
                    })
                  }
                  required
                >
                  {phoneBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Model *</label>
                <select
                  className="field"
                  required
                  value={form.model}
                  onChange={(e) =>
                    setForm({ ...form, model: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select model
                  </option>
                  {phoneModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Storage</label>
                <select
                  className="field"
                  value={form.storage}
                  onChange={(e) =>
                    setForm({ ...form, storage: e.target.value })
                  }
                >
                  {STORAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {isAppleBrand(form.brand) && (
                <div>
                  <label className="field-label">Battery health</label>
                  <select
                    className="field"
                    value={form.batteryHealth}
                    onChange={(e) =>
                      setForm({ ...form, batteryHealth: e.target.value })
                    }
                  >
                    <option value="">Not sure</option>
                    {BATTERY_HEALTH_OPTIONS.filter(
                      (o) => o.value !== "unknown"
                    ).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Issue type *</label>
              <select
                className="field"
                value={form.issueCategory}
                onChange={(e) =>
                  setForm({ ...form, issueCategory: e.target.value })
                }
                required
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Describe the problem</label>
              <textarea
                className="field min-h-[110px]"
                placeholder="When did it start? Any drops, liquid, or recent updates?"
                value={form.issueDescription}
                onChange={(e) =>
                  setForm({ ...form, issueDescription: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Preparing steps…" : "Show troubleshooting steps"}
            </button>
          </form>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/90 p-6 sm:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Try these steps
              </h2>
              <ol className="mt-6 space-y-5">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft/75">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[1.5rem] bg-fog p-6 sm:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                Still not fixed?
              </h2>
              <p className="mt-2 text-sm text-ink-soft/80">
                Submit a repair request. Estimated charges:{" "}
                <strong className="text-teal">
                  ₹{estimateMin?.toLocaleString("en-IN")}
                  {estimateMax != null &&
                    estimateMin != null &&
                    estimateMax > estimateMin && (
                      <>–₹{estimateMax.toLocaleString("en-IN")}</>
                    )}
                </strong>
                . Confirmed after diagnosis.
              </p>
              <PriceLockBadge
                className="mt-4"
                validUntil={estimateValidUntil}
                amountLabel="repair estimate"
              />
              {store && (
                <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm">
                  <p className="font-semibold">{store.name}</p>
                  <p className="mt-1 text-ink-soft/80">{store.address}</p>
                  <p className="mt-1 text-ink-soft/80">{store.hours}</p>
                  <p className="mt-1 font-semibold text-teal">{store.phone}</p>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/repair?${repairQuery}`}
                  className="btn-primary"
                >
                  Submit repair request
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSteps(null)}
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
