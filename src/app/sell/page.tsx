"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  BATTERY_HEALTH_OPTIONS,
  BODY_CONDITION_OPTIONS,
  CONDITIONS,
  SCREEN_CONDITION_OPTIONS,
  STORAGE_OPTIONS,
  isAppleBrand,
} from "@/lib/troubleshooting-constants";
import { brandsForDeviceType, sellPhoneModelsForBrand } from "@/lib/fix-catalog";
import { useFixCatalog } from "@/lib/use-fix-catalog";
import { EstimateModal } from "@/components/EstimateModal";
import { PageBanner } from "@/components/PageBanner";
import { PriceLockBadge } from "@/components/PriceLockBadge";

type Result = {
  inquiryId: string;
  estimatedPrice: number;
  estimateValidUntil?: string;
  store: {
    name: string;
    address: string;
    phone: string;
    hours: string;
  };
  disclaimer: string;
};

export default function SellPage() {
  const { categories } = useFixCatalog();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    brand: "Apple",
    model: "",
    storage: "128GB",
    condition: "good",
    batteryHealth: "",
    hasBox: false,
    hasCharger: false,
    screenCondition: "",
    bodyCondition: "",
    notes: "",
  });
  const sellBrands = brandsForDeviceType("phone", categories);
  const sellModels = sellPhoneModelsForBrand(form.brand, categories);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <PageBanner
          eyebrow="Fair buyback"
          title="Sell your phone"
          image="/images/banners/banner-sell.png"
          imageAlt="Phone ready for buyback"
          accent="amber"
        >
          Get an instant estimate online, then visit the store for a final
          offer after physical inspection.
        </PageBanner>

        <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Your name *</label>
                <input
                  className="field"
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">WhatsApp number *</label>
                <input
                  className="field"
                  required
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>
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
                >
                  {sellBrands.map((b) => (
                    <option key={b}>{b}</option>
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
                  {sellModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Storage *</label>
                <select
                  className="field"
                  value={form.storage}
                  onChange={(e) =>
                    setForm({ ...form, storage: e.target.value })
                  }
                >
                  {STORAGE_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Overall condition *</label>
                <select
                  className="field"
                  value={form.condition}
                  onChange={(e) =>
                    setForm({ ...form, condition: e.target.value })
                  }
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {isAppleBrand(form.brand) && (
                <div>
                  <label className="field-label">Battery health *</label>
                  <select
                    className="field"
                    required
                    value={form.batteryHealth}
                    onChange={(e) =>
                      setForm({ ...form, batteryHealth: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select battery health
                    </option>
                    {BATTERY_HEALTH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="field-label">Screen condition *</label>
                <select
                  className="field"
                  required
                  value={form.screenCondition}
                  onChange={(e) =>
                    setForm({ ...form, screenCondition: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select screen condition
                  </option>
                  {SCREEN_CONDITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Body condition *</label>
                <select
                  className="field"
                  required
                  value={form.bodyCondition}
                  onChange={(e) =>
                    setForm({ ...form, bodyCondition: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select body condition
                  </option>
                  {BODY_CONDITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasBox}
                  onChange={(e) =>
                    setForm({ ...form, hasBox: e.target.checked })
                  }
                />
                Original box
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasCharger}
                  onChange={(e) =>
                    setForm({ ...form, hasCharger: e.target.checked })
                  }
                />
                Charger / cable
              </label>
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea
                className="field min-h-[90px]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Calculating…" : "Get estimated price"}
            </button>
        </form>

        <EstimateModal open={Boolean(result)} onClose={() => setResult(null)}>
          {result && (
            <>
              <p className="pr-8 text-sm font-semibold uppercase tracking-wider text-amber">
                Estimate ready
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
                ₹{result.estimatedPrice.toLocaleString("en-IN")}
              </h2>
              <p className="mt-1 text-sm text-ink-soft/70">
                Inquiry ID: {result.inquiryId}
              </p>
              <p className="mt-4 text-sm text-ink-soft/80">{result.disclaimer}</p>
              <PriceLockBadge
                className="mt-4"
                validUntil={result.estimateValidUntil}
                amountLabel="sell estimate"
              />
              <div className="mt-6 rounded-xl bg-amber-soft/50 p-4 text-sm">
                <p className="font-semibold">{result.store.name}</p>
                <p className="mt-1">{result.store.address}</p>
                <p className="mt-1">{result.store.hours}</p>
                <p className="mt-1 font-semibold text-teal">
                  {result.store.phone}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="btn-primary">
                  Done
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setResult(null)}
                >
                  New estimate
                </button>
              </div>
            </>
          )}
        </EstimateModal>
      </div>
    </div>
  );
}
