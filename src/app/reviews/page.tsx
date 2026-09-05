"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  name: string;
  device: string | null;
  rating: number;
  body: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    device: "",
    phoneNumber: "",
    rating: "5",
    body: "",
  });

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, [done]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          device: form.device,
          phoneNumber: form.phoneNumber,
          rating: Number(form.rating),
          body: form.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setForm({
        name: "",
        device: "",
        phoneNumber: "",
        rating: "5",
        body: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Customer voices
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Reviews
        </h1>
        <p className="mt-3 text-ink-soft/80">
          Share your experience. New reviews appear on the site after we
          approve them.
        </p>

        {done ? (
          <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
            <p className="font-semibold text-teal">Thanks for your review</p>
            <p className="mt-2 text-sm text-ink-soft/75">
              We’ll publish it after a quick check.
            </p>
            <button
              type="button"
              className="btn-secondary mt-4 !py-2 text-sm"
              onClick={() => setDone(false)}
            >
              Write another
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Your name *</label>
                <input
                  className="field"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Device (optional)</label>
                <input
                  className="field"
                  placeholder="iPhone 15 / Pixel 8"
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Phone (optional)</label>
                <input
                  className="field"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Rating</label>
                <select
                  className="field"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Your review *</label>
              <textarea
                className="field min-h-[120px]"
                required
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit review"}
            </button>
          </form>
        )}

        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Published reviews
          </h2>
          <div className="mt-6 space-y-4">
            {reviews.map((r) => (
              <blockquote
                key={r.id}
                className="rounded-2xl border border-[var(--line)] bg-white/80 p-5"
              >
                <p className="text-sm text-amber">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/80">
                  “{r.body}”
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {r.name}
                  {r.device && (
                    <span className="font-normal text-ink-soft/60">
                      {" "}
                      · {r.device}
                    </span>
                  )}
                </p>
              </blockquote>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-ink-soft/60">
                No published reviews yet — be the first.
              </p>
            )}
          </div>
        </div>

        <Link href="/" className="btn-secondary mt-10 inline-flex">
          Back home
        </Link>
      </div>
    </div>
  );
}
