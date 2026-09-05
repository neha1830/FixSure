"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CONDITIONS,
  PHONE_BRANDS,
  STORAGE_OPTIONS,
} from "@/lib/troubleshooting";
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber">
          Fair buyback
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Sell your phone
        </h1>
        <p className="mt-3 text-ink-soft/80">
          Get an instant estimate online, then visit the store for a final
          offer after physical inspection.
        </p>

        {result ? (
          <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber">
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
          </div>
        ) : (
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
                    setForm({ ...form, brand: e.target.value })
                  }
                >
                  {PHONE_BRANDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Model *</label>
                <input
                  className="field"
                  required
                  value={form.model}
                  onChange={(e) =>
                    setForm({ ...form, model: e.target.value })
                  }
                />
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
              <div>
                <label className="field-label">Battery health %</label>
                <input
                  className="field"
                  value={form.batteryHealth}
                  onChange={(e) =>
                    setForm({ ...form, batteryHealth: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Screen condition</label>
                <input
                  className="field"
                  placeholder="No cracks / minor scratches…"
                  value={form.screenCondition}
                  onChange={(e) =>
                    setForm({ ...form, screenCondition: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Body condition</label>
                <input
                  className="field"
                  placeholder="Dents, paint wear…"
                  value={form.bodyCondition}
                  onChange={(e) =>
                    setForm({ ...form, bodyCondition: e.target.value })
                  }
                />
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
        )}
      </div>
    </div>
  );
}
