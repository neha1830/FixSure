"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  PART_DEVICE_CATEGORIES,
  PART_QUALITIES,
} from "@/lib/parts-constants";

export type PartItem = {
  id: string;
  title: string;
  description: string | null;
  deviceCategory: string;
  brand: string | null;
  sku: string | null;
  quality: string;
  compatibility: string | null;
  price: number;
  imageUrl: string | null;
  inStock: boolean;
  published: boolean;
  sortOrder: number;
};

type Props = {
  password: string;
  parts: PartItem[];
  onChanged: () => Promise<void> | void;
};

const emptyForm = {
  title: "",
  description: "",
  deviceCategory: "phone",
  brand: "",
  sku: "",
  quality: "COPY",
  compatibility: "",
  price: "",
  imageUrl: "",
  inStock: true,
  published: true,
  sortOrder: "0",
};

export function PartsManager({ password, parts, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parts.filter((p) => {
      if (filter !== "all" && p.deviceCategory !== filter) return false;
      if (!q) return true;
      const hay = [p.title, p.brand, p.sku, p.compatibility, p.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [parts, filter, search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      if (editId) fd.set("id", editId);
      fd.set("title", form.title);
      fd.set("description", form.description);
      fd.set("deviceCategory", form.deviceCategory);
      fd.set("brand", form.brand);
      fd.set("sku", form.sku);
      fd.set("quality", form.quality);
      fd.set("compatibility", form.compatibility);
      fd.set("price", form.price);
      fd.set("imageUrl", form.imageUrl);
      fd.set("inStock", String(form.inStock));
      fd.set("published", String(form.published));
      fd.set("sortOrder", form.sortOrder);
      fd.set("clearImage", String(clearImage));
      if (imageFile) fd.set("image", imageFile);

      const res = await fetch("/api/admin/parts", {
        method: editId ? "PUT" : "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(emptyForm);
      setEditId(null);
      setImageFile(null);
      setClearImage(false);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: PartItem) {
    setEditId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      deviceCategory: p.deviceCategory,
      brand: p.brand || "",
      sku: p.sku || "",
      quality: p.quality,
      compatibility: p.compatibility || "",
      price: String(p.price),
      imageUrl: p.imageUrl || "",
      inStock: p.inStock,
      published: p.published,
      sortOrder: String(p.sortOrder),
    });
    setImageFile(null);
    setClearImage(false);
  }

  async function remove(p: PartItem) {
    if (!confirm(`Delete “${p.title}”?`)) return;
    const res = await fetch(`/api/admin/parts?id=${encodeURIComponent(p.id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (!res.ok) {
      alert("Could not delete");
      return;
    }
    if (editId === p.id) {
      setEditId(null);
      setForm(emptyForm);
      setImageFile(null);
      setClearImage(false);
    }
    await onChanged();
  }

  const previewSrc =
    imageFile && !clearImage
      ? URL.createObjectURL(imageFile)
      : clearImage
        ? null
        : form.imageUrl || null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-soft/70">
          Parts-only catalogue for phones, tablets, laptops, and watches.
          Customers see published items on{" "}
          <span className="font-semibold text-teal">/parts</span>. Upload images
          are saved under{" "}
          <span className="font-mono text-xs">public/uploads/parts/</span>.
        </p>
        <div className="mt-3">
          <input
            className="field max-w-md"
            type="search"
            placeholder="Search admin list…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === "all" ? "bg-teal text-white" : "bg-white border"
            }`}
          >
            All
          </button>
          {PART_DEVICE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                filter === c.key ? "bg-teal text-white" : "bg-white border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/80 p-5"
      >
        <p className="font-semibold">{editId ? "Edit part" : "Add part"}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label">Title *</label>
            <input
              className="field"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Category *</label>
            <select
              className="field"
              value={form.deviceCategory}
              onChange={(e) =>
                setForm({ ...form, deviceCategory: e.target.value })
              }
            >
              {PART_DEVICE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Quality</label>
            <select
              className="field"
              value={form.quality}
              onChange={(e) => setForm({ ...form, quality: e.target.value })}
            >
              {PART_QUALITIES.map((q) => (
                <option key={q.key} value={q.key}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Brand</label>
            <input
              className="field"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">SKU</label>
            <input
              className="field"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Price (₹) *</label>
            <input
              className="field"
              required
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
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
          <div className="sm:col-span-2">
            <label className="field-label">Compatibility</label>
            <input
              className="field"
              placeholder="e.g. iPhone 13 / 13 Pro"
              value={form.compatibility}
              onChange={(e) =>
                setForm({ ...form, compatibility: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Description</label>
            <textarea
              className="field min-h-[80px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Part image (upload)</label>
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImageFile(e.target.files?.[0] || null);
                setClearImage(false);
              }}
            />
            <p className="mt-1 text-xs text-ink-soft/55">
              Or paste an external image URL below. Upload wins if both are set.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Image URL (optional)</label>
            <input
              className="field"
              value={form.imageUrl}
              onChange={(e) => {
                setForm({ ...form, imageUrl: e.target.value });
                setClearImage(false);
              }}
              placeholder="/uploads/parts/… or https://…"
            />
          </div>
          {previewSrc && (
            <div className="sm:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                className="h-32 w-auto rounded-xl border object-cover"
              />
              <button
                type="button"
                className="mt-2 text-xs text-red-700 underline"
                onClick={() => {
                  setImageFile(null);
                  setForm({ ...form, imageUrl: "" });
                  setClearImage(true);
                }}
              >
                Remove image
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) =>
                setForm({ ...form, inStock: e.target.checked })
              }
            />
            In stock
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Published
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : editId ? "Update part" : "Add part"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
                setImageFile(null);
                setClearImage(false);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-white/80 p-4"
          >
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  p.imageUrl ||
                  (p.deviceCategory === "phone"
                    ? "/parts/phone.svg"
                    : p.deviceCategory === "tablet"
                      ? "/parts/tablet.svg"
                      : p.deviceCategory === "macbook"
                        ? "/parts/laptop.svg"
                        : p.deviceCategory === "smartwatch"
                          ? "/parts/watch.svg"
                          : "/parts/other.svg")
                }
                alt=""
                className="h-16 w-24 rounded-lg object-cover bg-[#E8F4F2]"
              />
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-ink-soft/70">
                  {p.deviceCategory} · {p.quality} · ₹
                  {p.price.toLocaleString("en-IN")}
                  {p.sku ? ` · ${p.sku}` : ""}
                  {!p.inStock ? " · Out of stock" : ""}
                  {!p.published ? " · Hidden" : ""}
                </p>
                {p.compatibility && (
                  <p className="mt-1 text-xs text-ink-soft/60">
                    Fits: {p.compatibility}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary !py-1.5 text-xs"
                onClick={() => startEdit(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-secondary !py-1.5 text-xs !text-red-700"
                onClick={() => remove(p)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-ink-soft/60">No parts in this filter.</p>
        )}
      </div>
    </div>
  );
}
