"use client";

import { FormEvent, useState } from "react";

export type ContentItem = {
  id: string;
  type: string;
  key: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  meta: string | null;
  sortOrder: number;
  active: boolean;
};

const TYPE_HELP: Record<string, string> = {
  device: "Device categories on home & price. Key: phone|tablet|macbook|smartwatch. Meta: {\"multiplier\":1.35}",
  service: "Repair services + base price. Key: screen|battery|…. Meta: {\"basePrice\":2499}",
  brand: "Logo image only on home. Key: apple|samsung|…. Meta: {\"multiplier\":1.8,\"logoUrl\":\"/brands/apple.svg\"}",
  process: "3-step process section (title + body)",
  why: "Why us / quality points",
  trust: "Trust pillars on homepage",
  testimonial: "Title = name, subtitle = device, body = quote",
  faq: "Title = question, body = answer",
};

const TYPES = Object.keys(TYPE_HELP);

export function ContentManager({
  password,
  items,
  onChanged,
}: {
  password: string;
  items: ContentItem[];
  onChanged: () => void;
}) {
  const [filter, setFilter] = useState("service");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    type: "service",
    key: "",
    title: "",
    subtitle: "",
    body: "",
    meta: "",
    sortOrder: "0",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((i) => i.type === filter);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({
      type: filter,
      key: "",
      title: "",
      subtitle: "",
      body: "",
      meta:
        filter === "service"
          ? '{"basePrice":999}'
          : filter === "brand" || filter === "device"
            ? '{"multiplier":1}'
            : "",
      sortOrder: String(filtered.length),
      active: true,
    });
  }

  function startEdit(item: ContentItem) {
    setCreating(false);
    setEditing(item);
    setForm({
      type: item.type,
      key: item.key || "",
      title: item.title,
      subtitle: item.subtitle || "",
      body: item.body || "",
      meta: item.meta || "",
      sortOrder: String(item.sortOrder),
      active: item.active,
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        type: form.type,
        key: form.key,
        title: form.title,
        subtitle: form.subtitle,
        body: form.body,
        meta: form.meta,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };
      const res = await fetch("/api/admin/content", {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      setCreating(false);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/content?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (!res.ok) alert("Delete failed");
    else onChanged();
  }

  async function toggleActive(item: ContentItem) {
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (!res.ok) alert("Update failed");
    else onChanged();
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-ink-soft/80">
        Edit homepage sections, services, brands, FAQs, and pricing multipliers
        here. Changes appear on the live site immediately.{" "}
        <strong className="text-ink">Site name / hero / warranty days</strong>{" "}
        are under Store &amp; site settings.
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setFilter(t);
              setEditing(null);
              setCreating(false);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === t
                ? "bg-teal text-white"
                : "border border-[var(--line)] bg-white"
            }`}
          >
            {t} ({items.filter((i) => i.type === t).length})
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-soft/65">{TYPE_HELP[filter]}</p>

      <button type="button" className="btn-primary !py-2 text-sm" onClick={startCreate}>
        Add {filter}
      </button>

      {(creating || editing) && (
        <form
          onSubmit={save}
          className="space-y-3 rounded-2xl border border-teal/30 bg-mint/20 p-5"
        >
          <p className="font-semibold">
            {editing ? "Edit item" : "New item"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Type</label>
              <select
                className="field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Key (for pricing / links)</label>
              <input
                className="field"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="screen / apple / phone"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Title *</label>
              <input
                className="field"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Subtitle</label>
              <input
                className="field"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Body</label>
              <textarea
                className="field min-h-[80px]"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Meta JSON</label>
              <input
                className="field font-mono text-xs"
                value={form.meta}
                onChange={(e) => setForm({ ...form, meta: e.target.value })}
                placeholder='{"basePrice":2499}'
              />
            </div>
            <div>
              <label className="field-label">Sort order</label>
              <input
                className="field"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active (shown on website)
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary !py-2 text-sm" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn-secondary !py-2 text-sm"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border bg-white p-4 text-sm ${
              item.active ? "border-[var(--line)]" : "border-dashed opacity-60"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {item.title}{" "}
                  {item.key && (
                    <span className="font-mono text-xs font-normal text-ink-soft/50">
                      [{item.key}]
                    </span>
                  )}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-ink-soft/60">{item.subtitle}</p>
                )}
                {item.body && (
                  <p className="mt-1 line-clamp-2 text-ink-soft/75">{item.body}</p>
                )}
                {item.meta && (
                  <p className="mt-1 font-mono text-xs text-teal">{item.meta}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-teal"
                  onClick={() => startEdit(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-ink-soft"
                  onClick={() => toggleActive(item)}
                >
                  {item.active ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-amber"
                  onClick={() => remove(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-ink-soft/60">No items in this section yet.</p>
        )}
      </div>
    </div>
  );
}
