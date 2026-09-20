"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  DEFAULT_PRE_CHECKLIST,
  TECHNICIAN_OPTIONS,
} from "@/lib/job-sheet-constants";
import { DEVICE_TYPES, SERVICE_CATALOG } from "@/lib/catalog";
import { formatEstimateDisplay } from "@/lib/pricing";
import { STATUS_LABELS, type RepairStatus } from "@/lib/store-constants";

export type JobSheetRepair = {
  id: string;
  trackingId: string;
  customerName: string;
  phoneNumber: string;
  email?: string | null;
  brand: string;
  model: string;
  deviceType?: string;
  imei?: string | null;
  serialNumber?: string | null;
  devicePasscode?: string | null;
  technicianName?: string | null;
  dueDate?: string | null;
  preChecklist?: string | null;
  partsUsed?: string | null;
  issueCategory: string;
  issueDescription: string;
  status: string;
  estimatedCharge: number | null;
  estimatedChargeMax?: number | null;
  finalAmount: number | null;
  adminNotes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  password: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  onCreated: () => Promise<void> | void;
  onCancel: () => void;
  initial?: JobSheetRepair | null;
};

function parseCheckedKeys(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    /* plain text */
  }
  return [];
}

const emptyForm = {
  customerName: "",
  phoneNumber: "",
  email: "",
  deviceType: "phone",
  brand: "",
  model: "",
  serialNumber: "",
  imei: "",
  devicePasscode: "",
  technicianName: TECHNICIAN_OPTIONS[0],
  dueDate: "",
  issueCategory: "screen",
  issueDescription: "",
  estimatedCharge: "",
  estimatedChargeMax: "",
  partsUsed: "",
  adminNotes: "",
  sendWhatsApp: true,
};

export function JobSheetForm({
  password,
  onCreated,
  onCancel,
  initial,
}: Props) {
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState<string[]>(() =>
    parseCheckedKeys(initial?.preChecklist)
  );
  const [form, setForm] = useState(() =>
    initial
      ? {
          customerName: initial.customerName,
          phoneNumber: initial.phoneNumber,
          email: initial.email || "",
          deviceType: initial.deviceType || "phone",
          brand: initial.brand,
          model: initial.model,
          serialNumber: initial.serialNumber || "",
          imei: initial.imei || "",
          devicePasscode: initial.devicePasscode || "",
          technicianName: initial.technicianName || TECHNICIAN_OPTIONS[0],
          dueDate: initial.dueDate || "",
          issueCategory: initial.issueCategory || "screen",
          issueDescription: initial.issueDescription,
          estimatedCharge:
            initial.estimatedCharge != null
              ? String(initial.estimatedCharge)
              : "",
          estimatedChargeMax:
            initial.estimatedChargeMax != null
              ? String(initial.estimatedChargeMax)
              : "",
          partsUsed: initial.partsUsed || "",
          adminNotes: initial.adminNotes || "",
          sendWhatsApp: false,
        }
      : emptyForm
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        trackingId: initial?.trackingId,
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        deviceType: form.deviceType,
        brand: form.brand,
        model: form.model,
        serialNumber: form.serialNumber,
        imei: form.imei,
        devicePasscode: form.devicePasscode,
        technicianName: form.technicianName,
        dueDate: form.dueDate,
        issueCategory: form.issueCategory,
        issueDescription: form.issueDescription,
        estimatedCharge: form.estimatedCharge,
        estimatedChargeMax: form.estimatedChargeMax,
        partsUsed: form.partsUsed,
        adminNotes: form.adminNotes,
        preChecklist: checked,
        sendWhatsApp: form.sendWhatsApp,
        status: initial?.status || "RECEIVED",
      };

      const res = await fetch("/api/admin/job-sheet", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save job sheet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
    >
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        {isEdit ? `Edit job sheet ${initial?.trackingId}` : "Add job sheet"}
      </h2>
      <p className="mt-1 text-sm text-ink-soft/70">
        One page for walk-in intake — customer, device, checklist, parts, and
        estimate.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label">Customer name *</label>
          <input
            className="field"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Phone *</label>
          <input
            className="field"
            required
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Brand *</label>
          <input
            className="field"
            required
            placeholder="Apple / Samsung / …"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Device / model *</label>
          <input
            className="field"
            required
            placeholder="iPhone 13 / Galaxy S22"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Device type</label>
          <select
            className="field"
            value={form.deviceType}
            onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
          >
            {DEVICE_TYPES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Serial number</label>
          <input
            className="field"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">IMEI</label>
          <input
            className="field"
            value={form.imei}
            onChange={(e) => setForm({ ...form, imei: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Pattern / password</label>
          <input
            className="field"
            value={form.devicePasscode}
            onChange={(e) =>
              setForm({ ...form, devicePasscode: e.target.value })
            }
          />
        </div>
        <div>
          <label className="field-label">Technician</label>
          <select
            className="field"
            value={form.technicianName}
            onChange={(e) =>
              setForm({ ...form, technicianName: e.target.value })
            }
          >
            {TECHNICIAN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {form.technicianName &&
              !TECHNICIAN_OPTIONS.includes(
                form.technicianName as (typeof TECHNICIAN_OPTIONS)[number]
              ) && (
                <option value={form.technicianName}>{form.technicianName}</option>
              )}
          </select>
        </div>
        <div>
          <label className="field-label">Due date</label>
          <input
            className="field"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Issue type</label>
          <select
            className="field"
            value={form.issueCategory}
            onChange={(e) =>
              setForm({ ...form, issueCategory: e.target.value })
            }
          >
            {SERVICE_CATALOG.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Estimate from (₹)</label>
          <input
            className="field"
            type="number"
            min={0}
            placeholder="e.g. 1999"
            value={form.estimatedCharge}
            onChange={(e) =>
              setForm({ ...form, estimatedCharge: e.target.value })
            }
          />
        </div>
        <div>
          <label className="field-label">Estimate to (₹)</label>
          <input
            className="field"
            type="number"
            min={0}
            placeholder="e.g. 4499"
            value={form.estimatedChargeMax}
            onChange={(e) =>
              setForm({ ...form, estimatedChargeMax: e.target.value })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Problems / notes *</label>
          <textarea
            className="field min-h-[80px]"
            required
            value={form.issueDescription}
            onChange={(e) =>
              setForm({ ...form, issueDescription: e.target.value })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Parts used</label>
          <textarea
            className="field min-h-[64px]"
            placeholder="e.g. Copy display ×1, battery ×1"
            value={form.partsUsed}
            onChange={(e) => setForm({ ...form, partsUsed: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="field-label">Pre-check list</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {DEFAULT_PRE_CHECKLIST.map((item) => {
            const on = checked.includes(item.key);
            return (
              <label
                key={item.key}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setChecked((prev) =>
                      on
                        ? prev.filter((k) => k !== item.key)
                        : [...prev, item.key]
                    )
                  }
                />
                {item.label}
              </label>
            );
          })}
        </div>
      </div>

      {!isEdit && (
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.sendWhatsApp}
            onChange={(e) =>
              setForm({ ...form, sendWhatsApp: e.target.checked })
            }
          />
          Send job sheet summary on WhatsApp
        </label>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update job sheet" : "Create job sheet"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type PrintProps = {
  repair: JobSheetRepair;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  onClose: () => void;
  onEdit: () => void;
};

export function JobSheetPrint({
  repair,
  storeName,
  storePhone,
  storeAddress,
  onClose,
  onEdit,
}: PrintProps) {
  const checked = useMemo(
    () => new Set(parseCheckedKeys(repair.preChecklist)),
    [repair.preChecklist]
  );
  const trackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track?phone=${encodeURIComponent(repair.phoneNumber)}`
      : `/track?phone=${encodeURIComponent(repair.phoneNumber)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(trackUrl)}`;
  const estimate = formatEstimateDisplay(
    repair.estimatedCharge,
    repair.estimatedChargeMax
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center print:static print:bg-white print:p-0">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl print:max-h-none print:overflow-visible print:rounded-none print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Job sheet {repair.trackingId}
            </h2>
            <p className="text-sm text-ink-soft/70">
              {STATUS_LABELS[repair.status as RepairStatus] || repair.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={onEdit}>
              Edit
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.print()}
            >
              Print
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 border border-[var(--line)] print:border-black">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] bg-fog/60 px-5 py-4 print:bg-white">
            <div>
              <p className="text-lg font-bold">{storeName}</p>
              <p className="text-sm text-ink-soft/75">{storeAddress}</p>
              <p className="text-sm font-semibold text-teal">{storePhone}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold">{repair.trackingId}</p>
              <p className="mt-1 text-xs uppercase text-ink-soft/60">
                {STATUS_LABELS[repair.status as RepairStatus] || repair.status}
              </p>
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <Field label="Customer" value={repair.customerName} />
            <Field label="Phone" value={repair.phoneNumber} />
            <Field label="Brand" value={repair.brand} />
            <Field label="Device" value={repair.model} />
            <Field label="Serial" value={repair.serialNumber || "—"} />
            <Field label="IMEI" value={repair.imei || "—"} />
            <Field
              label="Pattern / password"
              value={repair.devicePasscode || "—"}
            />
            <Field label="Technician" value={repair.technicianName || "—"} />
            <Field label="Due date" value={repair.dueDate || "—"} />
            <Field label="Estimate" value={estimate} />
            <Field
              label="Final amount"
              value={
                repair.finalAmount != null
                  ? `₹${repair.finalAmount.toLocaleString("en-IN")}`
                  : "Pending"
              }
            />
            <Field label="Issue" value={repair.issueCategory} />
          </div>

          <div className="border-t border-[var(--line)] px-5 py-4">
            <p className="text-xs font-semibold uppercase text-ink-soft/60">
              Problems
            </p>
            <p className="mt-1 text-sm">{repair.issueDescription}</p>
          </div>

          <div className="border-t border-[var(--line)] px-5 py-4">
            <p className="text-xs font-semibold uppercase text-ink-soft/60">
              Parts used
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {repair.partsUsed || "—"}
            </p>
          </div>

          <div className="border-t border-[var(--line)] px-5 py-4">
            <p className="text-xs font-semibold uppercase text-ink-soft/60">
              Pre-check
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {DEFAULT_PRE_CHECKLIST.map((item) => (
                <li key={item.key} className="text-sm">
                  {checked.has(item.key) ? "☑" : "☐"} {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] px-5 py-4">
            <div className="text-sm text-ink-soft/75">
              <p className="font-semibold text-ink">Live status</p>
              <p className="mt-1">Scan QR or open track with customer mobile.</p>
              <p className="mt-1 break-all font-mono text-xs">{trackUrl}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="Track repair QR"
              width={140}
              height={140}
              className="rounded-lg border border-[var(--line)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--line)] px-5 py-3 sm:border-r">
      <p className="text-xs font-semibold uppercase text-ink-soft/55">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
