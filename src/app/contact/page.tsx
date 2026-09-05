"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="atmosphere flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-lg rounded-[1.5rem] border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow)]">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Message sent
          </h1>
          <p className="mt-3 text-ink-soft/80">
            Thanks — we’ll get back to you within 24 hours.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Get in touch
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">
          Contact us
        </h1>
        <p className="mt-3 text-ink-soft/80">
          Questions about repairs, warranty, or your visit? Send a note — we
          reply within 24 hours.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-5 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[var(--shadow)] sm:p-8"
        >
          <div>
            <label className="field-label">Full name *</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input
              className="field"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="field-label">Message *</label>
            <textarea
              className="field min-h-[120px]"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <p className="text-xs text-ink-soft/60">
            Provide at least email or phone so we can reply.
          </p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
