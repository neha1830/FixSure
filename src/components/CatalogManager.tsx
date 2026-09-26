"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FIX_CATEGORY_META } from "@/lib/fix-catalog";

export type CatalogModelRow = {
  id: string;
  seriesId: string;
  label: string;
  details: string | null;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
};

export type CatalogSeriesRow = {
  id: string;
  categoryId: string;
  label: string;
  brand: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
  models: CatalogModelRow[];
};

type Props = {
  password: string;
};

const emptySeries = {
  categoryId: "phone",
  label: "",
  brand: "",
  imageUrl: "",
  published: true,
  sortOrder: "0",
};

const emptyModel = {
  seriesId: "",
  label: "",
  details: "",
  imageUrl: "",
  published: true,
  sortOrder: "0",
};

export function CatalogManager({ password }: Props) {
  const [series, setSeries] = useState<CatalogSeriesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("phone");
  const [search, setSearch] = useState("");
  const [openSeriesId, setOpenSeriesId] = useState<string | null>(null);

  const [seriesForm, setSeriesForm] = useState(emptySeries);
  const [editSeriesId, setEditSeriesId] = useState<string | null>(null);
  const [seriesFile, setSeriesFile] = useState<File | null>(null);

  const [modelForm, setModelForm] = useState(emptyModel);
  const [editModelId, setEditModelId] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load catalog");
      setSeries(data.series || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not load catalog");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return series.filter((s) => {
      if (filter !== "all" && s.categoryId !== filter) return false;
      if (!q) return true;
      const hay = [
        s.label,
        s.brand,
        s.id,
        ...s.models.map((m) => `${m.label} ${m.details || ""}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [series, filter, search]);

  const seriesPreview =
    seriesFile && URL.createObjectURL(seriesFile) ||
    seriesForm.imageUrl ||
    null;
  const modelPreview =
    modelFile && URL.createObjectURL(modelFile) ||
    modelForm.imageUrl ||
    null;

  async function saveSeries(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("entity", "series");
      if (editSeriesId) fd.set("id", editSeriesId);
      fd.set("categoryId", seriesForm.categoryId);
      fd.set("label", seriesForm.label);
      fd.set("brand", seriesForm.brand || seriesForm.label);
      fd.set("imageUrl", seriesForm.imageUrl);
      fd.set("published", String(seriesForm.published));
      fd.set("sortOrder", seriesForm.sortOrder);
      if (seriesFile) fd.set("image", seriesFile);
      const res = await fetch("/api/admin/catalog", {
        method: editSeriesId ? "PUT" : "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeriesForm({ ...emptySeries, categoryId: seriesForm.categoryId });
      setEditSeriesId(null);
      setSeriesFile(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveModel(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("entity", "model");
      if (editModelId) fd.set("id", editModelId);
      fd.set("seriesId", modelForm.seriesId);
      fd.set("label", modelForm.label);
      fd.set("details", modelForm.details);
      fd.set("imageUrl", modelForm.imageUrl);
      fd.set("published", String(modelForm.published));
      fd.set("sortOrder", modelForm.sortOrder);
      if (modelFile) fd.set("image", modelFile);
      const res = await fetch("/api/admin/catalog", {
        method: editModelId ? "PUT" : "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModelForm({ ...emptyModel, seriesId: modelForm.seriesId });
      setEditModelId(null);
      setModelFile(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function startEditSeries(s: CatalogSeriesRow) {
    setEditSeriesId(s.id);
    setSeriesForm({
      categoryId: s.categoryId,
      label: s.label,
      brand: s.brand,
      imageUrl: s.imageUrl,
      published: s.published,
      sortOrder: String(s.sortOrder),
    });
    setSeriesFile(null);
  }

  function startEditModel(m: CatalogModelRow) {
    setEditModelId(m.id);
    setModelForm({
      seriesId: m.seriesId,
      label: m.label,
      details: m.details || "",
      imageUrl: m.imageUrl,
      published: m.published,
      sortOrder: String(m.sortOrder),
    });
    setModelFile(null);
    setOpenSeriesId(m.seriesId);
  }

  async function remove(entity: "series" | "model", id: string, label: string) {
    const extra =
      entity === "series" ? " This deletes every model in the series." : "";
    if (!confirm(`Delete “${label}”?${extra}`)) return;
    const res = await fetch(
      `/api/admin/catalog?entity=${entity}&id=${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { "x-admin-password": password } }
    );
    if (!res.ok) {
      alert("Could not delete");
      return;
    }
    if (entity === "series" && editSeriesId === id) {
      setEditSeriesId(null);
      setSeriesForm({ ...emptySeries, categoryId: filter === "all" ? "phone" : filter });
      setSeriesFile(null);
    }
    if (entity === "model" && editModelId === id) {
      setEditModelId(null);
      setModelForm(emptyModel);
      setModelFile(null);
    }
    await load();
  }

  return (
    <div className="mt-6 space-y-8">
      <div>
        <p className="text-sm text-ink-soft/70">
          Manage phones, laptops, iPads, and watches shown on Check Price,
          Repair, Sell, and Troubleshoot. Upload a photo for each series or
          model — files go to{" "}
          <span className="font-mono text-xs">public/uploads/catalog/</span>.
          Unpublish to hide without deleting.
        </p>
        <div className="mt-3">
          <input
            className="field max-w-md"
            type="search"
            placeholder="Search series or models…"
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
          {FIX_CATEGORY_META.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setFilter(c.id);
                if (!editSeriesId) {
                  setSeriesForm((f) => ({ ...f, categoryId: c.id }));
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                filter === c.id ? "bg-teal text-white" : "bg-white border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={saveSeries}
          className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-5"
        >
          <p className="text-sm font-semibold">
            {editSeriesId ? "Edit series / brand" : "Add series / brand"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Category *</label>
              <select
                className="field"
                value={seriesForm.categoryId}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, categoryId: e.target.value })
                }
              >
                {FIX_CATEGORY_META.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Brand *</label>
              <input
                className="field"
                required
                value={seriesForm.brand}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, brand: e.target.value })
                }
                placeholder="Samsung"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Series name *</label>
              <input
                className="field"
                required
                value={seriesForm.label}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, label: e.target.value })
                }
                placeholder="Galaxy S"
              />
            </div>
            <div>
              <label className="field-label">Sort order</label>
              <input
                className="field"
                type="number"
                value={seriesForm.sortOrder}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, sortOrder: e.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={seriesForm.published}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, published: e.target.checked })
                }
              />
              Published
            </label>
            <div className="sm:col-span-2">
              <label className="field-label">Photo</label>
              <input
                className="field"
                type="file"
                accept="image/*"
                onChange={(e) => setSeriesFile(e.target.files?.[0] || null)}
              />
              <input
                className="field mt-2"
                placeholder="Or paste image URL"
                value={seriesForm.imageUrl}
                onChange={(e) =>
                  setSeriesForm({ ...seriesForm, imageUrl: e.target.value })
                }
              />
              {seriesPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seriesPreview}
                  alt=""
                  className="mt-2 h-20 w-20 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary !py-2 text-sm" disabled={saving}>
              {saving ? "Saving…" : editSeriesId ? "Update series" : "Add series"}
            </button>
            {editSeriesId && (
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() => {
                  setEditSeriesId(null);
                  setSeriesForm({
                    ...emptySeries,
                    categoryId: filter === "all" ? "phone" : filter,
                  });
                  setSeriesFile(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <form
          onSubmit={saveModel}
          className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-5"
        >
          <p className="text-sm font-semibold">
            {editModelId ? "Edit device" : "Add device / model"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label">Series *</label>
              <select
                className="field"
                required
                value={modelForm.seriesId}
                onChange={(e) =>
                  setModelForm({ ...modelForm, seriesId: e.target.value })
                }
              >
                <option value="" disabled>
                  Select series
                </option>
                {series
                  .filter((s) => filter === "all" || s.categoryId === filter)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.brand})
                    </option>
                  ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Model name *</label>
              <input
                className="field"
                required
                value={modelForm.label}
                onChange={(e) =>
                  setModelForm({ ...modelForm, label: e.target.value })
                }
                placeholder="Galaxy S24 Ultra"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Details</label>
              <textarea
                className="field min-h-[4.5rem]"
                value={modelForm.details}
                onChange={(e) =>
                  setModelForm({ ...modelForm, details: e.target.value })
                }
                placeholder="Year, storage notes, colourways…"
              />
            </div>
            <div>
              <label className="field-label">Sort order</label>
              <input
                className="field"
                type="number"
                value={modelForm.sortOrder}
                onChange={(e) =>
                  setModelForm({ ...modelForm, sortOrder: e.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={modelForm.published}
                onChange={(e) =>
                  setModelForm({ ...modelForm, published: e.target.checked })
                }
              />
              Published
            </label>
            <div className="sm:col-span-2">
              <label className="field-label">Photo</label>
              <input
                className="field"
                type="file"
                accept="image/*"
                onChange={(e) => setModelFile(e.target.files?.[0] || null)}
              />
              <input
                className="field mt-2"
                placeholder="Or paste image URL"
                value={modelForm.imageUrl}
                onChange={(e) =>
                  setModelForm({ ...modelForm, imageUrl: e.target.value })
                }
              />
              {modelPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={modelPreview}
                  alt=""
                  className="mt-2 h-20 w-20 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary !py-2 text-sm" disabled={saving}>
              {saving ? "Saving…" : editModelId ? "Update device" : "Add device"}
            </button>
            {editModelId && (
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() => {
                  setEditModelId(null);
                  setModelForm(emptyModel);
                  setModelFile(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft/60">Loading catalogue…</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const open = openSeriesId === s.id;
            return (
              <div
                key={s.id}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
              >
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpenSeriesId(open ? null : s.id)}
                  >
                    <p className="font-semibold">
                      {s.label}
                      {!s.published && (
                        <span className="ml-2 text-xs font-medium text-ink-soft/50">
                          Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-soft/60">
                      {s.brand} · {s.models.length} models
                    </p>
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-teal"
                    onClick={() => {
                      setOpenSeriesId(s.id);
                      setModelForm({ ...emptyModel, seriesId: s.id });
                      setEditModelId(null);
                      setModelFile(null);
                    }}
                  >
                    + Model
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-teal"
                    onClick={() => startEditSeries(s)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600"
                    onClick={() => remove("series", s.id, s.label)}
                  >
                    Delete
                  </button>
                </div>
                {open && (
                  <div className="border-t border-[var(--line)]">
                    {s.models.length === 0 && (
                      <p className="px-4 py-3 text-sm text-ink-soft/55">
                        No models yet. Use the form above to add one.
                      </p>
                    )}
                    {s.models.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center gap-3 border-t border-[var(--line)]/70 px-4 py-2.5 first:border-t-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {m.label}
                            {!m.published && (
                              <span className="ml-2 text-xs font-medium text-ink-soft/50">
                                Hidden
                              </span>
                            )}
                          </p>
                          {m.details && (
                            <p className="text-xs text-ink-soft/60">{m.details}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-xs font-semibold text-teal"
                          onClick={() => startEditModel(m)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600"
                          onClick={() => remove("model", m.id, m.label)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-ink-soft/60">No series in this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
