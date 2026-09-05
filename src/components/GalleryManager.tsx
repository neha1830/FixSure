"use client";

import { FormEvent, useState } from "react";

export type GalleryItem = {
  id: string;
  title: string;
  device: string;
  repairType: string | null;
  beforeUrl: string;
  afterUrl: string;
  caption: string | null;
  consentGiven: boolean;
  published: boolean;
  createdAt: string;
};

type Props = {
  password: string;
  items: GalleryItem[];
  onChanged: () => Promise<void> | void;
};

export function GalleryManager({ password, items, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    device: "",
    repairType: "",
    caption: "",
    beforeUrl: "",
    afterUrl: "",
    consentGiven: false,
    published: true,
  });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("title", form.title);
      fd.set("device", form.device);
      fd.set("repairType", form.repairType);
      fd.set("caption", form.caption);
      fd.set("beforeUrl", form.beforeUrl);
      fd.set("afterUrl", form.afterUrl);
      fd.set("consentGiven", String(form.consentGiven));
      fd.set("published", String(form.published));
      if (beforeFile) fd.set("before", beforeFile);
      if (afterFile) fd.set("after", afterFile);

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({
        title: "",
        device: "",
        repairType: "",
        caption: "",
        beforeUrl: "",
        afterUrl: "",
        consentGiven: false,
        published: true,
      });
      setBeforeFile(null);
      setAfterFile(null);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: GalleryItem) {
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    if (!res.ok) {
      alert("Could not update");
      return;
    }
    await onChanged();
  }

  async function remove(item: GalleryItem) {
    if (!confirm(`Delete “${item.title}”?`)) return;
    const res = await fetch(`/api/admin/gallery?id=${item.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    await onChanged();
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
          Before / after gallery
        </h2>
        <p className="mt-1 text-sm text-ink-soft/70">
          Only publish when the customer has consented. Photos appear on the
          public Gallery page.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Title *</label>
            <input
              className="field"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Screen replaced — crystal clear"
            />
          </div>
          <div>
            <label className="field-label">Device *</label>
            <input
              className="field"
              required
              value={form.device}
              onChange={(e) => setForm({ ...form, device: e.target.value })}
              placeholder="iPhone 13"
            />
          </div>
          <div>
            <label className="field-label">Repair type</label>
            <input
              className="field"
              value={form.repairType}
              onChange={(e) =>
                setForm({ ...form, repairType: e.target.value })
              }
              placeholder="Screen / battery / charging port"
            />
          </div>
          <div>
            <label className="field-label">Caption</label>
            <input
              className="field"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Before photo (upload)</label>
            <input
              type="file"
              accept="image/*"
              className="field !py-2"
              onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
            />
            <input
              className="field mt-2"
              placeholder="Or paste image URL"
              value={form.beforeUrl}
              onChange={(e) =>
                setForm({ ...form, beforeUrl: e.target.value })
              }
            />
          </div>
          <div>
            <label className="field-label">After photo (upload)</label>
            <input
              type="file"
              accept="image/*"
              className="field !py-2"
              onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
            />
            <input
              className="field mt-2"
              placeholder="Or paste image URL"
              value={form.afterUrl}
              onChange={(e) => setForm({ ...form, afterUrl: e.target.value })}
            />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.consentGiven}
            onChange={(e) =>
              setForm({ ...form, consentGiven: e.target.checked })
            }
            required
          />
          <span>
            Customer gave written consent to publish these before/after photos
            (faces/personal data not visible).
          </span>
        </label>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Add to gallery"}
        </button>
      </form>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-ink-soft/70">
                  {item.device}
                  {item.repairType ? ` · ${item.repairType}` : ""}
                  {!item.published ? " · Hidden" : ""}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-semibold">
                <button
                  type="button"
                  className="text-teal"
                  onClick={() => togglePublish(item)}
                >
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => remove(item)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.beforeUrl}
                alt={`Before ${item.device}`}
                className="h-36 w-full rounded-xl object-cover"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.afterUrl}
                alt={`After ${item.device}`}
                className="h-36 w-full rounded-xl object-cover"
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-ink-soft/60">No gallery items yet.</p>
        )}
      </div>
    </div>
  );
}
