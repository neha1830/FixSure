"use client";

import { FormEvent, useState } from "react";
import { REPAIR_STATUSES, STATUS_LABELS, RepairStatus, WHATSAPP_NOTIFY_STATUSES } from "@/lib/store";
import { ScenarioManager, Scenario } from "@/components/ScenarioManager";
import { GalleryManager, GalleryItem } from "@/components/GalleryManager";

type Repair = {
  id: string;
  trackingId: string;
  customerName: string;
  phoneNumber: string;
  brand: string;
  model: string;
  issueCategory: string;
  issueDescription: string;
  status: string;
  estimatedCharge: number | null;
  finalAmount: number | null;
  adminNotes: string | null;
  updatedAt: string;
};

type Sell = {
  id: string;
  inquiryId: string;
  customerName: string;
  phoneNumber: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  estimatedPrice: number;
  status: string;
  createdAt: string;
};

type WaLog = {
  id: string;
  phoneNumber: string;
  message: string;
  success: boolean;
  createdAt: string;
  relatedType: string | null;
};

type StoreForm = {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<
    | "repairs"
    | "sells"
    | "whatsapp"
    | "settings"
    | "scenarios"
    | "gallery"
  >("repairs");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [sells, setSells] = useState<Sell[]>([]);
  const [whatsapp, setWhatsapp] = useState<WaLog[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [storeForm, setStoreForm] = useState<StoreForm>({
    name: "",
    address: "",
    phone: "",
    hours: "",
    mapsUrl: "",
  });
  const [selected, setSelected] = useState<Repair | null>(null);
  const [status, setStatus] = useState("RECEIVED");
  const [finalAmount, setFinalAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendMessage, setSendMessage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);

  async function load(pass: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-password": pass },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setRepairs(data.repairs);
      setSells(data.sells);
      setWhatsapp(data.whatsapp);
      setScenarios(data.scenarios || []);
      setGallery(data.gallery || []);
      if (data.store) {
        setStoreForm({
          name: data.store.name || "",
          address: data.store.address || "",
          phone: data.store.phone || "",
          hours: data.store.hours || "",
          mapsUrl: data.store.mapsUrl || "",
        });
      }
      setAuthed(true);
      setPassword(pass);
    } catch {
      alert("Wrong password");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    load(password);
  }

  function openRepair(r: Repair) {
    setSelected(r);
    const next = r.status === "REQUESTED" ? "RECEIVED" : r.status;
    setStatus(next);
    setFinalAmount(r.finalAmount?.toString() || "");
    setAdminNotes(r.adminNotes || "");
    setSendMessage(
      WHATSAPP_NOTIFY_STATUSES.includes(next as RepairStatus)
    );
  }

  async function saveUpdate(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          trackingId: selected.trackingId,
          status,
          finalAmount: finalAmount === "" ? null : Number(finalAmount),
          adminNotes,
          sendMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load(password);
      setSelected(null);
      alert(
        sendMessage
          ? "Updated and WhatsApp notification queued."
          : "Updated without WhatsApp."
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function updateSellStatus(inquiryId: string, next: string) {
    const res = await fetch("/api/admin/sell", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ inquiryId, status: next }),
    });
    if (!res.ok) {
      alert("Could not update sell inquiry");
      return;
    }
    await load(password);
  }

  async function saveStore(e: FormEvent) {
    e.preventDefault();
    setSavingStore(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(storeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStoreForm(data.store);
      alert("Store details saved. They now appear across the website.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSavingStore(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassword(pwForm.newPassword);
      setPwForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert(data.message || "Password updated.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setSavingPw(false);
    }
  }

  if (!authed) {
    return (
      <div className="atmosphere flex min-h-[70vh] items-center justify-center px-5">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]"
        >
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Admin
          </h1>
          <p className="mt-2 text-sm text-ink-soft/70">
            Update repair stages, amounts, and trigger WhatsApp messages.
          </p>
          <label className="field-label mt-6">Password</label>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ADMIN_PASSWORD from .env"
            required
          />
          <button
            type="submit"
            className="btn-primary mt-5 w-full"
            disabled={loading}
          >
            {loading ? "Checking…" : "Enter dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              FixSure admin
            </h1>
            <p className="mt-1 text-sm text-ink-soft/70">
              {repairs.length} repairs · {sells.length} sell inquiries
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary !py-2 text-sm"
            onClick={() => load(password)}
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["repairs", "Repairs"],
              ["sells", "Sell inquiries"],
              ["scenarios", "Troubleshoot"],
              ["gallery", "Gallery"],
              ["whatsapp", "WhatsApp log"],
              ["settings", "Store settings"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === key
                  ? "bg-teal text-white"
                  : "bg-white text-ink-soft border border-[var(--line)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "repairs" && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-fog/80 text-xs uppercase text-ink-soft/60">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--line)]">
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.trackingId}
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.customerName}</div>
                      <div className="text-xs text-ink-soft/60">
                        {r.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.brand} {r.model}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-mint/50 px-2 py-1 text-xs font-semibold text-teal-deep">
                        {STATUS_LABELS[r.status as RepairStatus] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.finalAmount != null
                        ? `₹${r.finalAmount}`
                        : r.estimatedCharge != null
                          ? `~₹${r.estimatedCharge}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-sm font-semibold text-teal"
                        onClick={() => openRepair(r)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
                {repairs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-ink-soft/60"
                    >
                      No repair requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sells" && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-fog/80 text-xs uppercase text-ink-soft/60">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Estimate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sells.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--line)]">
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.inquiryId}
                    </td>
                    <td className="px-4 py-3">
                      {s.customerName}
                      <div className="text-xs text-ink-soft/60">
                        {s.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.brand} {s.model} · {s.storage}
                      <div className="text-xs text-ink-soft/60">
                        {s.condition}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{s.estimatedPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">{s.status}</td>
                    <td className="px-4 py-3">
                      <select
                        className="field !py-1.5 text-xs"
                        value={s.status}
                        onChange={(e) =>
                          updateSellStatus(s.inquiryId, e.target.value)
                        }
                      >
                        <option value="ESTIMATED">ESTIMATED</option>
                        <option value="VISITED">VISITED</option>
                        <option value="PURCHASED">PURCHASED</option>
                        <option value="DECLINED">DECLINED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "scenarios" && (
          <ScenarioManager
            password={password}
            scenarios={scenarios}
            onChanged={() => load(password)}
          />
        )}

        {tab === "gallery" && (
          <GalleryManager
            password={password}
            items={gallery}
            onChanged={() => load(password)}
          />
        )}

        {tab === "whatsapp" && (
          <div className="mt-6 space-y-3">
            {whatsapp.map((w) => (
              <div
                key={w.id}
                className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-soft/60">
                  <span>
                    {w.phoneNumber} · {w.relatedType || "general"}
                  </span>
                  <span>
                    {new Date(w.createdAt).toLocaleString("en-IN")} ·{" "}
                    {w.success ? "sent/logged" : "failed"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-ink-soft">
                  {w.message}
                </p>
              </div>
            ))}
            {whatsapp.length === 0 && (
              <p className="text-sm text-ink-soft/60">No messages yet.</p>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="mt-6 max-w-xl space-y-6">
            <form
              onSubmit={saveStore}
              className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                  Store contact details
                </h2>
                <p className="mt-1 text-sm text-ink-soft/70">
                  These show on the homepage, header, footer, repair/sell pages,
                  and in WhatsApp messages.
                </p>
              </div>
              <div>
                <label className="field-label">Store name</label>
                <input
                  className="field"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="field-label">Address *</label>
                <textarea
                  className="field min-h-[80px]"
                  value={storeForm.address}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, address: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="field-label">Phone / WhatsApp number *</label>
                <input
                  className="field"
                  value={storeForm.phone}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label className="field-label">Hours</label>
                <input
                  className="field"
                  value={storeForm.hours}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, hours: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Google Maps link</label>
                <input
                  className="field"
                  value={storeForm.mapsUrl}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, mapsUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={savingStore}
              >
                {savingStore ? "Saving…" : "Save store details"}
              </button>
            </form>

            <form
              onSubmit={savePassword}
              className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                  Change admin password
                </h2>
                <p className="mt-1 text-sm text-ink-soft/70">
                  Bookmark{" "}
                  <span className="font-mono text-xs">/admin</span> yourself —
                  the link is hidden from customers.
                </p>
              </div>
              <div>
                <label className="field-label">Current password</label>
                <input
                  className="field"
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, currentPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">New password</label>
                <input
                  className="field"
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Confirm new password</label>
                <input
                  className="field"
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, confirmPassword: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary" disabled={savingPw}>
                {savingPw ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form
            onSubmit={saveUpdate}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Update {selected.trackingId}
            </h2>
            <p className="mt-1 text-sm text-ink-soft/70">
              {selected.customerName} · {selected.brand} {selected.model}
            </p>
            <p className="mt-3 text-sm text-ink-soft/80">
              {selected.issueDescription}
            </p>

            <label className="field-label mt-5">Status</label>
            <select
              className="field"
              value={status}
              onChange={(e) => {
                const next = e.target.value;
                setStatus(next);
                setSendMessage(
                  WHATSAPP_NOTIFY_STATUSES.includes(next as RepairStatus)
                );
              }}
            >
              {REPAIR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <label className="field-label mt-4">
              Final / confirmed amount (₹)
            </label>
            <input
              className="field"
              type="number"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              placeholder={`Estimate ~${selected.estimatedCharge ?? ""}`}
            />

            <label className="field-label mt-4">Admin notes</label>
            <textarea
              className="field min-h-[80px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={sendMessage}
                disabled={
                  !WHATSAPP_NOTIFY_STATUSES.includes(status as RepairStatus)
                }
                onChange={(e) => setSendMessage(e.target.checked)}
              />
              <span>
                Send WhatsApp update
                {WHATSAPP_NOTIFY_STATUSES.includes(status as RepairStatus)
                  ? " (allowed for “submitted” / “ready” only)"
                  : " — only when status is Received or Ready"}
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save & notify"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
