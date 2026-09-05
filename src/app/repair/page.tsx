"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ISSUE_CATEGORIES,
  PHONE_BRANDS,
  STORAGE_OPTIONS,
} from "@/lib/troubleshooting";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { WipeChecklist } from "@/components/WipeChecklist";

type Result = {
  trackingId: string;
  phoneNumber?: string;
  estimatedCharge: number;
  estimateValidUntil?: string;
  store: {
    name: string;
    address: string;
    phone: string;
    hours: string;
  };
  message: string;
};

function RepairForm() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [categories, setCategories] = useState(ISSUE_CATEGORIES);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    brand: params.get("brand") || "Apple",
    model: params.get("model") || "",
    storage: params.get("storage") || "128GB",
    batteryHealth: params.get("batteryHealth") || "",
    color: "",
    imei: "",
    issueCategory: params.get("issueCategory") || "screen",
    issueDescription: params.get("issueDescription") || "",
    troubleshootTried: params.get("troubleshootTried") === "1",
    privacyAck: false,
  });

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/repair", {
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

  if (result) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal">
          Request saved
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
          You’re all set
        </h2>
        <p className="mt-3 text-ink-soft/80">{result.message}</p>
        <p className="mt-2 text-sm text-ink-soft/70">
          Track anytime with your mobile number
          {result.phoneNumber ? (
            <>
              :{" "}
              <strong className="text-ink">{result.phoneNumber}</strong>
            </>
          ) : (
            "."
          )}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-fog p-4">
            <p className="text-xs font-semibold uppercase text-ink-soft/60">
              Estimated charges
            </p>
            <p className="mt-1 text-2xl font-bold text-teal">
              ₹{result.estimatedCharge.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-ink-soft/60">
              Final amount after diagnosis
            </p>
          </div>
          <div className="rounded-xl bg-fog p-4 text-sm">
            <p className="font-semibold">{result.store.name}</p>
            <p className="mt-1 text-ink-soft/80">{result.store.address}</p>
            <p className="mt-1">{result.store.hours}</p>
            <p className="mt-1 font-semibold text-teal">
              {result.store.phone}
            </p>
          </div>
        </div>
        <PriceLockBadge
          className="mt-4"
          validUntil={result.estimateValidUntil}
          amountLabel="repair estimate"
        />
        <p className="mt-6 text-sm text-ink-soft/70">
          Bring your phone to the store. Once submitted for repair, you&apos;ll
          get a WhatsApp confirmation and updates as status changes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/track?phone=${encodeURIComponent(result.phoneNumber || form.phoneNumber)}`}
            className="btn-primary"
          >
            Track with mobile number
          </Link>
          <Link href="/" className="btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
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
            placeholder="10-digit mobile"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Email</label>
          <input
            className="field"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t border-[var(--line)] pt-5">
        <p className="mb-4 text-sm font-semibold text-ink-soft">
          Phone details
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Brand *</label>
            <select
              className="field"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Storage</label>
            <select
              className="field"
              value={form.storage}
              onChange={(e) => setForm({ ...form, storage: e.target.value })}
            >
              {STORAGE_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
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
            <label className="field-label">Color</label>
            <input
              className="field"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">IMEI (optional)</label>
            <input
              className="field"
              value={form.imei}
              onChange={(e) => setForm({ ...form, imei: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="field-label">Issue type *</label>
        <select
          className="field"
          value={form.issueCategory}
          onChange={(e) =>
            setForm({ ...form, issueCategory: e.target.value })
          }
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Issue description *</label>
        <textarea
          className="field min-h-[100px]"
          required
          value={form.issueDescription}
          onChange={(e) =>
            setForm({ ...form, issueDescription: e.target.value })
          }
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.troubleshootTried}
          onChange={(e) =>
            setForm({ ...form, troubleshootTried: e.target.checked })
          }
        />
        I already tried the troubleshooting steps
      </label>

      <div className="rounded-xl border border-[var(--line)] bg-mist/60 p-4">
        <p className="text-sm font-semibold text-ink">
          Before you visit
        </p>
        <p className="mt-1 text-xs text-ink-soft/70">
          We never access photos without permission. No need to sign out or
          factory-reset.{" "}
          <Link href="/privacy" className="font-semibold text-teal">
            Full privacy pledge
          </Link>
        </p>
        <div className="mt-4">
          <WipeChecklist compact />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          required
          checked={form.privacyAck}
          onChange={(e) =>
            setForm({ ...form, privacyAck: e.target.checked })
          }
        />
        <span>
          I understand FixSure will not access my photos or personal data
          without permission. *
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Submitting…" : "Submit repair request"}
      </button>
    </form>
  );
}

export default function RepairPage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Book a visit
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Repair request
        </h1>
        <p className="mt-3 text-ink-soft/80">
          We save your details, share estimated charges, and message you on
          WhatsApp when your phone is received and as repair progresses.
        </p>
        <div className="mt-10">
          <Suspense fallback={<p>Loading form…</p>}>
            <RepairForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
