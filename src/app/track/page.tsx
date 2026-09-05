"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STATUS_LABELS, RepairStatus } from "@/lib/store";
import { PriceLockBadge } from "@/components/PriceLockBadge";

type Log = {
  id: string;
  status: string;
  message: string;
  amount: number | null;
  createdAt: string;
};

type Repair = {
  trackingId: string;
  customerName: string;
  phoneNumber: string;
  brand: string;
  model: string;
  issueCategory: string;
  issueDescription: string;
  status: string;
  estimatedCharge: number | null;
  estimateValidUntil?: string | null;
  finalAmount: number | null;
  statusLogs: Log[];
};

type StoreInfo = {
  name: string;
  address: string;
  phone: string;
  hours: string;
};

const order = [
  "REQUESTED",
  "RECEIVED",
  "DIAGNOSING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
];

function RepairCard({
  repair,
  store,
}: {
  repair: Repair;
  store: StoreInfo | null;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-soft/60">Device</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
              {repair.brand} {repair.model}
            </p>
            <p className="mt-1 text-sm text-ink-soft/80">
              {repair.customerName}
            </p>
          </div>
          <div className="rounded-full bg-mint/60 px-4 py-2 text-sm font-semibold text-teal-deep">
            {STATUS_LABELS[repair.status as RepairStatus] || repair.status}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {order.map((s) => {
            const idx = order.indexOf(s);
            const current = order.indexOf(repair.status);
            const done =
              repair.status === "COMPLETED" ||
              (current >= 0 && idx <= current);
            return (
              <div
                key={s}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  done ? "bg-teal text-white" : "bg-fog text-ink-soft/50"
                }`}
              >
                {STATUS_LABELS[s as RepairStatus]}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-fog p-4">
            <p className="text-xs uppercase text-ink-soft/60">Estimated</p>
            <p className="text-xl font-bold">
              ₹{(repair.estimatedCharge ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-fog p-4">
            <p className="text-xs uppercase text-ink-soft/60">Final amount</p>
            <p className="text-xl font-bold text-teal">
              {repair.finalAmount != null
                ? `₹${repair.finalAmount.toLocaleString("en-IN")}`
                : "Pending diagnosis"}
            </p>
          </div>
        </div>

        {repair.estimateValidUntil && (
          <PriceLockBadge
            className="mt-4"
            validUntil={repair.estimateValidUntil}
            amountLabel="repair estimate"
          />
        )}

        <p className="mt-6 text-sm text-ink-soft/75">
          <strong>Issue:</strong> {repair.issueDescription}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
          Timeline
        </h2>
        <ul className="mt-5 space-y-4">
          {repair.statusLogs.map((log) => (
            <li
              key={log.id}
              className="flex gap-3 border-l-2 border-mint pl-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {STATUS_LABELS[log.status as RepairStatus] || log.status}
                </p>
                <p className="text-sm text-ink-soft/70">{log.message}</p>
                <p className="mt-1 text-xs text-ink-soft/50">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                  {log.amount != null
                    ? ` · ₹${log.amount.toLocaleString("en-IN")}`
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {store && (
        <div className="rounded-xl bg-ink p-5 text-sm text-mint">
          <p className="font-semibold text-white">{store.name}</p>
          <p className="mt-1 opacity-80">{store.address}</p>
          <p className="mt-1 opacity-80">{store.hours}</p>
          <p className="mt-1 font-semibold">{store.phone}</p>
        </div>
      )}
    </div>
  );
}

function TrackInner() {
  const params = useSearchParams();
  const phoneFromUrl = params.get("phone")?.trim() || "";
  const [phone, setPhone] = useState(phoneFromUrl);
  const [loading, setLoading] = useState(false);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [error, setError] = useState("");

  async function lookup(mobile: string) {
    setLoading(true);
    setError("");
    setRepairs([]);
    setSelectedId(null);
    try {
      const res = await fetch(
        `/api/repair?phone=${encodeURIComponent(mobile.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setRepairs(data.repairs || []);
      setStore(data.store);
      if (data.repairs?.length === 1) {
        setSelectedId(data.repairs[0].trackingId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Not found");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!phoneFromUrl) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/repair?phone=${encodeURIComponent(phoneFromUrl)}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Not found");
        setRepairs(data.repairs || []);
        setStore(data.store);
        setSelectedId(
          data.repairs?.length === 1 ? data.repairs[0].trackingId : null
        );
        setError("");
      } catch (err) {
        if (cancelled) return;
        setRepairs([]);
        setSelectedId(null);
        setError(err instanceof Error ? err.message : "Not found");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phoneFromUrl]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (phone.trim()) lookup(phone);
  }

  const selected =
    repairs.find((r) => r.trackingId === selectedId) ||
    (repairs.length === 1 ? repairs[0] : null);

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Transparency
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Track your repair
        </h1>
        <p className="mt-3 text-ink-soft/80">
          Enter the mobile number you used when submitting the repair request.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            className="field flex-1"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Looking up…" : "Track"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {repairs.length > 1 && !selected && (
          <div className="mt-8 space-y-3">
            <p className="text-sm font-semibold text-ink-soft">
              Multiple repairs found — pick one:
            </p>
            {repairs.map((r) => (
              <button
                key={r.trackingId}
                type="button"
                onClick={() => setSelectedId(r.trackingId)}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-sm transition hover:border-teal"
              >
                <span>
                  <span className="font-semibold">
                    {r.brand} {r.model}
                  </span>
                  <span className="mt-0.5 block text-ink-soft/60">
                    {r.issueCategory}
                    {r.statusLogs[0]?.createdAt
                      ? ` · ${new Date(r.statusLogs[0].createdAt).toLocaleDateString("en-IN")}`
                      : ""}
                  </span>
                </span>
                <span className="rounded-full bg-mint/50 px-2 py-1 text-xs font-semibold text-teal-deep">
                  {STATUS_LABELS[r.status as RepairStatus] || r.status}
                </span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-10">
            {repairs.length > 1 && (
              <button
                type="button"
                className="mb-4 text-sm font-semibold text-teal"
                onClick={() => setSelectedId(null)}
              >
                ← All repairs for this number
              </button>
            )}
            <RepairCard repair={selected} store={store} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}
