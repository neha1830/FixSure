"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ISSUE_CATEGORIES,
  PHONE_BRANDS,
  STORAGE_OPTIONS,
} from "@/lib/troubleshooting-constants";
import { SERVICE_CATALOG } from "@/lib/catalog";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { WipeChecklist } from "@/components/WipeChecklist";
import { DeviceIcon } from "@/components/Icons";

type Result = {
  trackingId: string;
  phoneNumber?: string;
  estimatedCharge: number;
  estimateValidUntil?: string;
  requestValidDays?: number;
  visitBy?: string;
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
  const [warrantyDays, setWarrantyDays] = useState(90);
  const [requestValidDays, setRequestValidDays] = useState(3);
  const [brandName, setBrandName] = useState("PhoneRepairO");
  const [categories, setCategories] = useState(
    ISSUE_CATEGORIES.length
      ? ISSUE_CATEGORIES
      : SERVICE_CATALOG.map((s) => ({ value: s.id, label: s.label }))
  );
  const [brands, setBrands] = useState<string[]>([...PHONE_BRANDS]);
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([
    { id: "phone", label: "Mobile Phone" },
    { id: "tablet", label: "Tablet" },
    { id: "macbook", label: "MacBook / Laptop" },
    { id: "smartwatch", label: "Smartwatch" },
  ]);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    deviceType: params.get("deviceType") || "phone",
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
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.store?.warrantyDays) setWarrantyDays(data.store.warrantyDays);
        if (data.store?.requestValidDays)
          setRequestValidDays(data.store.requestValidDays);
        if (data.store?.name) setBrandName(data.store.name);
        if (data.byType?.brand?.length) {
          setBrands(data.byType.brand.map((b: { title: string }) => b.title));
        }
        if (data.byType?.device?.length) {
          setDevices(
            data.byType.device.map(
              (d: { key: string | null; title: string }) => ({
                id: d.key || d.title,
                label: d.title,
              })
            )
          );
        }
        if (data.byType?.service?.length) {
          setCategories(
            data.byType.service.map(
              (s: { key: string | null; title: string }) => ({
                value: s.key || s.title,
                label: s.title,
              })
            )
          );
        }
      })
      .catch(() => {});

    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((data) => {
        const fromApi: { value: string; label: string }[] =
          data.categories || [];
        if (!fromApi.length) return;
        setCategories((prev) => {
          const merged = [...prev];
          for (const c of fromApi) {
            const i = merged.findIndex((m) => m.value === c.value);
            if (i >= 0) merged[i] = c;
            else merged.push(c);
          }
          return merged;
        });
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
        body: JSON.stringify({ ...form, serviceMode: "STORE" }),
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
    const visitByText = result.visitBy
      ? new Date(result.visitBy).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    return (
      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal">
          Request saved
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
          You’re all set
        </h2>
        <p className="mt-3 text-ink-soft/80">{result.message}</p>
        <div className="mt-4 rounded-xl border border-amber/30 bg-amber-soft/40 px-4 py-3 text-sm text-ink-soft">
          <p className="font-semibold text-ink">
            Bring your phone within {result.requestValidDays ?? requestValidDays}{" "}
            days
          </p>
          <p className="mt-1">
            Submit your device at the store
            {visitByText ? ` by ${visitByText}` : ""} or this request becomes{" "}
            <strong>null and void</strong> and you’ll need to raise a fresh one.
          </p>
        </div>
        <p className="mt-3 text-sm text-ink-soft/70">
          Track anytime with your mobile number
          {result.phoneNumber ? (
            <>
              : <strong className="text-ink">{result.phoneNumber}</strong>
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
              Final amount after diagnosis · up to {warrantyDays}-day warranty
            </p>
          </div>
          <div className="rounded-xl bg-fog p-4 text-sm">
            <p className="font-semibold">{result.store.name}</p>
            <p className="mt-1 text-ink-soft/80">{result.store.address}</p>
            <p className="mt-1">{result.store.hours}</p>
            <p className="mt-1 font-semibold text-teal">{result.store.phone}</p>
          </div>
        </div>
        <PriceLockBadge
          className="mt-4"
          validUntil={result.estimateValidUntil}
          amountLabel="repair estimate"
        />
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
      <div className="rounded-xl border border-teal/20 bg-mint/30 p-4 text-sm text-ink-soft">
        <p className="font-semibold text-teal-deep">Why raise a request?</p>
        <p className="mt-1">
          It helps our technicians know about upcoming work and plan parts and
          time accordingly — so your store visit is smoother and faster.
        </p>
        <p className="mt-2 font-semibold text-ink">
          Important: bring your phone within {requestValidDays} days of this
          request, or it becomes null and void.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink-soft">Device type</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setForm({ ...form, deviceType: d.id })}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm ${
                form.deviceType === d.id
                  ? "border-teal bg-mint/40 font-semibold"
                  : "border-[var(--line)]"
              }`}
            >
              <span className="icon-tile !h-9 !w-9 !rounded-lg">
                <DeviceIcon deviceKey={d.id} size={18} />
              </span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

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
          Device details
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Brand *</label>
            <select
              className="field"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            >
              {brands.map((b) => (
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
        <p className="text-sm font-semibold text-ink">Before you visit</p>
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
          I understand {brandName} will not access my photos or personal data
          without permission, and I will bring my device within{" "}
          {requestValidDays} days or this request becomes void. *
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
          Book a store visit
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Repair request
        </h1>
        <p className="mt-3 text-ink-soft/80">
          Tell us about your device so technicians can plan ahead. Then bring
          it to the store within the validity window.{" "}
          <Link href="/price" className="font-semibold text-teal">
            Check price first
          </Link>
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
