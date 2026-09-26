"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EstimateModal } from "@/components/EstimateModal";
import { PriceLockBadge } from "@/components/PriceLockBadge";
import { DeviceIcon, IconArrow, ServiceIcon } from "@/components/Icons";
import {
  FIX_CATEGORY_META,
  getFixCategory,
  getSeries,
  modelImage,
  modelsForSeries,
  resolveFromQuery,
  searchFixModels,
  type FixCategoryId,
  type FixModel,
  type FixSearchHit,
} from "@/lib/fix-catalog";
import { useFixCatalog } from "@/lib/use-fix-catalog";
import { issueAllowedForDevice } from "@/lib/troubleshooting-constants";
type ServiceRow = {
  id: string;
  key: string | null;
  title: string;
  subtitle: string | null;
};

type Step = "models" | "issues" | "estimate";

export function DeviceFixFlow() {
  const params = useSearchParams();
  const { categories } = useFixCatalog();
  const initial = resolveFromQuery({
    deviceType: params.get("deviceType") || params.get("category"),
    series: params.get("series"),
    brand: params.get("brand"),
  }, categories);

  const [categoryId, setCategoryId] = useState<FixCategoryId>(
    initial.categoryId
  );
  const [seriesId, setSeriesId] = useState(initial.seriesId);
  const [model, setModel] = useState<FixModel | null>(null);
  const [issueCategory, setIssueCategory] = useState(
    params.get("issueCategory") || ""
  );
  const [step, setStep] = useState<Step>("models");
  const [showAllSeries, setShowAllSeries] = useState(false);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [warrantyDays, setWarrantyDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    estimatedChargeMin: number;
    estimatedChargeMax: number;
    estimateValidUntil: string;
    priceLockDays: number;
    warrantyDays: number;
  } | null>(null);

  const [showAllModels, setShowAllModels] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const searching = deferredQuery.length > 0;
  const searchHits = useMemo(
    () =>
      searching ? searchFixModels(deferredQuery, categoryId, categories) : [],
    [searching, deferredQuery, categoryId, categories]
  );

  const category = useMemo(
    () => getFixCategory(categoryId, categories),
    [categoryId, categories]
  );
  const series = useMemo(
    () => getSeries(category, seriesId),
    [category, seriesId]
  );
  const allModels = useMemo(
    () => modelsForSeries(category, series.id),
    [category, series.id]
  );
  const models = showAllModels ? allModels : allModels.slice(0, 18);

  const visibleSeries = showAllSeries
    ? category.series
    : category.series.slice(0, 15);
  const visibleServices = useMemo(
    () =>
      services.filter((s) =>
        issueAllowedForDevice(s.key || s.title, category.deviceType)
      ),
    [services, category.deviceType]
  );

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.byType?.service) {
          setServices(
            data.byType.service.filter(
              (s: ServiceRow) => s.key !== "other"
            )
          );
        }
        if (data.store?.warrantyDays) setWarrantyDays(data.store.warrantyDays);
      })
      .catch(() => {});
  }, []);

  // Sync from URL when landing from homepage cards
  useEffect(() => {
    const next = resolveFromQuery(
      {
        deviceType: params.get("deviceType") || params.get("category"),
        series: params.get("series"),
        brand: params.get("brand"),
      },
      categories
    );
    const issue = params.get("issueCategory");
    queueMicrotask(() => {
      setCategoryId(next.categoryId);
      setSeriesId(next.seriesId);
      setModel(null);
      setStep("models");
      setResult(null);
      if (issue) setIssueCategory(issue);
    });
    // categories used for lookup only — do not reset when the live catalog hydrates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    const cat = getFixCategory(categoryId, categories);
    if (seriesId && cat.series.length && !cat.series.some((s) => s.id === seriesId)) {
      const fallback = cat.series[0].id;
      queueMicrotask(() => setSeriesId(fallback));
    }
  }, [categories, categoryId, seriesId]);

  function selectCategory(id: FixCategoryId) {
    const cat = getFixCategory(id, categories);
    setCategoryId(id);
    setSeriesId(cat.series[0]?.id || "");
    setModel(null);
    setStep("models");
    setResult(null);
    setShowAllSeries(false);
    setShowAllModels(false);
  }

  function selectSeries(id: string) {
    setSeriesId(id);
    setModel(null);
    setStep("models");
    setResult(null);
    setShowAllModels(false);
    setQuery("");
  }

  function selectModel(m: FixModel) {
    setModel(m);
    setStep("issues");
    setResult(null);
    setIssueCategory("");
    setQuery("");
  }

  function selectSearchHit(hit: FixSearchHit) {
    setCategoryId(hit.categoryId);
    setSeriesId(hit.series.id);
    setModel(hit.model);
    setStep("issues");
    setResult(null);
    setIssueCategory("");
    setQuery("");
    setShowAllSeries(false);
    setShowAllModels(false);
  }

  async function getEstimate(issueKey: string) {
    setIssueCategory(issueKey);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType: category.deviceType,
          brand: series.brand,
          issueCategory: issueKey,
          serviceMode: "STORE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setStep("issues");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not get price");
    } finally {
      setLoading(false);
    }
  }

  const bookHref = useMemo(() => {
    const q = new URLSearchParams({
      deviceType: category.deviceType,
      brand: series.brand,
      issueCategory: issueCategory || "screen",
      model: model?.label || "",
    });
    return `/repair?${q.toString()}`;
  }, [category.deviceType, series.brand, issueCategory, model]);

  return (
    <div className="mt-8">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px">
        {FIX_CATEGORY_META.map((c) => {
          const on = categoryId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCategory(c.id)}
              className={`relative flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-t-2xl px-4 py-3 transition sm:min-w-[7rem] sm:px-5 ${
                on
                  ? "bg-white text-teal shadow-[0_-4px_20px_rgba(12,31,28,0.04)]"
                  : "text-ink-soft/50 hover:bg-white/80 hover:text-ink-soft"
              }`}
            >
              <DeviceIcon deviceKey={c.deviceType} size={22} />
              <span className="text-sm font-semibold">{c.label}</span>
              {on && (
                <span className="absolute inset-x-4 -bottom-px h-[3px] rounded-full bg-teal" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <label htmlFor="price-model-search" className="field-label">
          Search model
        </label>
        <input
          id="price-model-search"
          className="field"
          type="search"
          placeholder={`Search ${category.label} models…`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setStep("models");
              setModel(null);
              setResult(null);
            }
          }}
        />
      </div>

      {searching && searchHits.length > 0 ? (
        <div className="mt-8">
          <p className="text-sm font-semibold text-ink-soft/70">
            Search results
            <span className="ml-2 font-normal text-ink-soft/50">
              ({searchHits.length}{" "}
              {searchHits.length === 1 ? "device" : "devices"})
            </span>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {searchHits.map((hit) => (
              <button
                key={`${hit.categoryId}-${hit.model.id}`}
                type="button"
                onClick={() => selectSearchHit(hit)}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-[0_8px_22px_rgba(12,31,28,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(12,31,28,0.12)]"
              >
                <div className="product-stage">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={modelImage(
                      getFixCategory(hit.categoryId, categories),
                      hit.model
                    )}
                    alt={hit.model.label}
                    className="product-stage__photo"
                    width={480}
                    height={384}
                  />
                </div>
                <p className="bg-white px-1.5 pt-2 text-center text-[10px] font-semibold leading-snug text-ink sm:px-2 sm:text-[11px]">
                  {hit.model.label}
                </p>
                <p className="bg-white px-1.5 pb-2 text-center text-[10px] text-ink-soft/55">
                  {hit.categoryLabel} · {hit.series.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {searching && searchHits.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft/65">
          No device matches “{query.trim()}”. Try another name or pick a series
          below.
        </p>
      ) : null}

      {/* Series */}
      {(!searching || searchHits.length === 0) && (
      <div className="mt-8">
        <p className="text-sm font-semibold text-ink-soft/70">Select series</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleSeries.map((s) => {
            const on = seriesId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSeries(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? "bg-teal text-white shadow-sm"
                    : "border border-[var(--line)] bg-white text-ink-soft hover:border-teal/40"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {category.series.length > 15 && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllSeries((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
            >
              {showAllSeries ? "Show less" : "View all series"}
              <span
                className={`transition ${showAllSeries ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
          </div>
        )}
      </div>
      )}

      {/* Models */}
      {step === "models" && (!searching || searchHits.length === 0) && allModels.length === 0 && (
        <p className="mt-10 text-sm text-ink-soft/65">
          No models in this series yet. Add them from the admin Devices tab.
        </p>
      )}

      {step === "models" && (!searching || searchHits.length === 0) && allModels.length > 0 && (
        <div className="mt-10">
          <p className="text-sm font-semibold text-ink-soft/70">
            Select model
            <span className="ml-2 font-normal text-ink-soft/50">
              ({allModels.length} devices)
            </span>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectModel(m)}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-[0_8px_22px_rgba(12,31,28,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(12,31,28,0.12)]"
              >
                <div className="product-stage">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={modelImage(category, m)}
                    alt={m.label}
                    className="product-stage__photo"
                    width={480}
                    height={384}
                  />
                </div>
                <p className="bg-white px-1.5 pt-2 text-center text-[10px] font-semibold leading-snug text-ink sm:px-2 sm:text-[11px]">
                  {m.label}
                </p>
                {m.details ? (
                  <p className="bg-white px-1.5 pb-2 text-center text-[10px] text-ink-soft/55">
                    {m.details}
                  </p>
                ) : (
                  <div className="bg-white pb-2" />
                )}
              </button>
            ))}
          </div>
          {allModels.length > 18 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllModels((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-teal shadow-sm transition hover:border-teal/40 hover:bg-mint/20"
              >
                {showAllModels
                  ? "Show less"
                  : `View all ${allModels.length} models`}
                <span
                  className={`transition ${showAllModels ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Issues after model pick */}
      {(step === "issues" || step === "estimate") && model && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => {
              setStep("models");
              setModel(null);
              setResult(null);
            }}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-teal"
          >
            ← Change model
          </button>

          <div className="mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-3 shadow-sm">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modelImage(category, model)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                Selected
              </p>
              <p className="font-semibold text-ink">{model.label}</p>
              <p className="text-sm text-ink-soft/65">
                {series.label}
                {model.details ? ` · ${model.details}` : ""}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-ink-soft/70">
            What can we fix?
          </p>
          <p className="mt-1 text-sm text-ink-soft/60">
            Tap an issue for a clear ₹range — up to {warrantyDays}-day warranty
            on eligible jobs.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {visibleServices.map((s) => {
              const key = s.key || s.title;
              const active = issueCategory === key;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={loading}
                  onClick={() => getEstimate(key)}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-teal bg-mint/35 ring-2 ring-teal/15"
                      : "border-[var(--line)] bg-white hover:border-teal/40 hover:shadow-sm"
                  }`}
                >
                  <span className="icon-tile !h-11 !w-11 shrink-0">
                    <ServiceIcon serviceKey={s.key} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="block text-sm font-semibold">
                        {s.title}
                      </span>
                      <IconArrow size={14} className="shrink-0 text-teal" />
                    </span>
                    {s.subtitle && (
                      <span className="mt-0.5 block text-xs text-ink-soft/65">
                        {s.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="mt-6 text-sm font-semibold text-teal">
              Calculating estimate…
            </p>
          )}
        </div>
      )}

      <EstimateModal open={Boolean(result)} onClose={() => setResult(null)}>
        {result && (
          <>
            <p className="pr-8 text-sm font-semibold uppercase tracking-wider text-teal">
              Your estimate
            </p>
            {model && (
              <p className="mt-1 text-sm text-ink-soft/70">{model.label}</p>
            )}
            <p className="mt-3 text-4xl font-bold text-teal sm:text-5xl">
              ₹{result.estimatedChargeMin.toLocaleString("en-IN")}
              {result.estimatedChargeMax > result.estimatedChargeMin && (
                <>–₹{result.estimatedChargeMax.toLocaleString("en-IN")}</>
              )}
            </p>
            <p className="mt-3 text-sm text-ink-soft/75">
              Includes parts and technician labour. Final amount after diagnosis.
            </p>
            <PriceLockBadge
              className="mt-4"
              validUntil={result.estimateValidUntil}
              amountLabel="repair estimate"
              lockDays={result.priceLockDays}
            />
            <p className="mt-4 text-sm text-ink-soft/75">
              Eligible jobs include up to {result.warrantyDays}-day warranty.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={bookHref} className="btn-primary">
                Book store visit
              </Link>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn-secondary"
              >
                Pick another issue
              </button>
              <Link href="/troubleshoot" className="btn-secondary">
                Try free DIY first
              </Link>
            </div>
          </>
        )}
      </EstimateModal>
    </div>
  );
}
