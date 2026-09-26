"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BATTERY_HEALTH_OPTIONS,
  ISSUE_CATEGORIES,
  defaultIssueForDevice,
  defaultStorageForDevice,
  filterIssuesForDevice,
  isAppleBrand,
  issueAllowedForDevice,
  storageOptionsForDevice,
} from "@/lib/troubleshooting-constants";
import { SERVICE_CATALOG } from "@/lib/catalog";
import { brandsForDeviceType, repairModelsForDevice } from "@/lib/fix-catalog";
import { useFixCatalog } from "@/lib/use-fix-catalog";
import { PageBanner } from "@/components/PageBanner";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { WipeChecklist } from "@/components/WipeChecklist";
import { deviceIllustration } from "@/lib/illustrations";

type Result = {
  trackingId: string;
  phoneNumber?: string;
  estimatedCharge: number;
  estimatedChargeMin?: number;
  estimatedChargeMax?: number;
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
  const { categories: catalog } = useFixCatalog();
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
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([
    { id: "phone", label: "Mobile Phone" },
    { id: "tablet", label: "Tablet" },
    { id: "macbook", label: "Laptop" },
    { id: "smartwatch", label: "Smartwatch" },
  ]);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    deviceType: params.get("deviceType") || "phone",
    brand: params.get("brand") || "Apple",
    model: params.get("model") || "",
    storage:
      params.get("storage") ||
      defaultStorageForDevice(params.get("deviceType") || "phone"),
    batteryHealth: params.get("batteryHealth") || "",
    issueCategory: params.get("issueCategory") || "screen",
    issueDescription: params.get("issueDescription") || "",
    troubleshootTried: params.get("troubleshootTried") === "1",
    privacyAck: false,
  });

  useEffect(() => {
    const nextBrands = brandsForDeviceType(form.deviceType, catalog);
    const brandOk = nextBrands.includes(form.brand);
    const storageOk = storageOptionsForDevice(form.deviceType).includes(
      form.storage
    );
    const issueOk = issueAllowedForDevice(
      form.issueCategory,
      form.deviceType
    );
    if (brandOk && storageOk && issueOk) return;
    const brand = brandOk ? form.brand : nextBrands[0] || "Other";
    queueMicrotask(() =>
      setForm((f) => ({
        ...f,
        brand,
        model: brandOk ? f.model : "",
        storage: storageOk
          ? f.storage
          : defaultStorageForDevice(f.deviceType),
        issueCategory: issueOk
          ? f.issueCategory
          : defaultIssueForDevice(f.deviceType),
        batteryHealth: isAppleBrand(brand) ? f.batteryHealth : "",
      }))
    );
  }, [form.deviceType, form.brand, form.storage, form.issueCategory, catalog]);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.store?.warrantyDays) setWarrantyDays(data.store.warrantyDays);
        if (data.store?.requestValidDays)
          setRequestValidDays(data.store.requestValidDays);
        if (data.store?.name) setBrandName(data.store.name);
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

  const deviceBrands = brandsForDeviceType(form.deviceType, catalog);
  const modelOptions = (() => {
    const models = repairModelsForDevice(form.deviceType, form.brand, catalog);
    if (form.model && !models.includes(form.model)) {
      return [form.model, ...models];
    }
    return models;
  })();
  const showBatteryHealth = isAppleBrand(form.brand);
  const storageOptions = storageOptionsForDevice(form.deviceType);
  const issueOptions = filterIssuesForDevice(categories, form.deviceType);

  function applyDeviceType(deviceType: string) {
    const nextBrands = brandsForDeviceType(deviceType, catalog);
    const brand = nextBrands.includes(form.brand)
      ? form.brand
      : nextBrands[0] || "Other";
    const models = repairModelsForDevice(deviceType, brand, catalog);
    const model = models.includes(form.model) ? form.model : "";
    const storage = storageOptionsForDevice(deviceType).includes(form.storage)
      ? form.storage
      : defaultStorageForDevice(deviceType);
    const issueCategory = issueAllowedForDevice(form.issueCategory, deviceType)
      ? form.issueCategory
      : defaultIssueForDevice(deviceType);
    setForm({
      ...form,
      deviceType,
      brand,
      model,
      storage,
      issueCategory,
      batteryHealth: isAppleBrand(brand) ? form.batteryHealth : "",
    });
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
              Estimated charges (all-in)
            </p>
            <p className="mt-1 text-2xl font-bold text-teal">
              ₹
              {(
                result.estimatedChargeMin ?? result.estimatedCharge
              ).toLocaleString("en-IN")}
              {result.estimatedChargeMax != null &&
                result.estimatedChargeMax >
                  (result.estimatedChargeMin ?? result.estimatedCharge) && (
                  <>
                    –₹{result.estimatedChargeMax.toLocaleString("en-IN")}
                  </>
                )}
            </p>
            <p className="mt-1 text-xs text-ink-soft/60">
              Includes labour · up to {warrantyDays}-day warranty
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
        <div className="grid grid-cols-4 gap-2">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => applyDeviceType(d.id)}
              className={`overflow-hidden rounded-xl border text-center transition ${
                form.deviceType === d.id
                  ? "border-teal bg-mint/25 ring-2 ring-teal/15"
                  : "border-[var(--line)] hover:border-teal/40"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-fog">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deviceIllustration(d.id)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="px-1 py-1.5 text-[11px] font-semibold leading-tight sm:text-xs">
                {d.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-sm font-semibold text-ink-soft">
          Device details
        </p>
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
            >
              {deviceBrands.map((b) => (
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
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            >
              <option value="" disabled>
                Select model
              </option>
              {modelOptions.map((m) => (
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
              onChange={(e) => setForm({ ...form, storage: e.target.value })}
            >
              {storageOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {showBatteryHealth && (
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
                {BATTERY_HEALTH_OPTIONS.filter((o) => o.value !== "unknown").map(
                  (o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
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

      <div>
        <label className="field-label">Issue type *</label>
        <select
          className="field"
          value={form.issueCategory}
          onChange={(e) =>
            setForm({ ...form, issueCategory: e.target.value })
          }
        >
          {issueOptions.map((c) => (
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
        <PageBanner
          eyebrow="Book a store visit"
          title="Repair request"
          image="/images/banners/banner-repair.png"
          imageAlt="Phone being repaired on a clean bench"
        >
          Tell us about your device so technicians can plan ahead. Then bring
          it to the store within the validity window.{" "}
          <Link href="/price" className="font-semibold text-teal">
            Check price first
          </Link>
        </PageBanner>
        <div className="mt-10">
          <Suspense fallback={<p>Loading form…</p>}>
            <RepairForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
