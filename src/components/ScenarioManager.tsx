"use client";

import { FormEvent, useState } from "react";

export type ScenarioStep = {
  id?: string;
  title: string;
  detail: string;
  sortOrder?: number;
};

export type Scenario = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  steps: ScenarioStep[];
};

type Props = {
  password: string;
  scenarios: Scenario[];
  onChanged: () => Promise<void> | void;
};

const emptyStep = (): ScenarioStep => ({ title: "", detail: "" });

export function ScenarioManager({ password, scenarios, onChanged }: Props) {
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    key: "",
    label: "",
    description: "",
    active: true,
    steps: [emptyStep()],
  });
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({
      key: "",
      label: "",
      description: "",
      active: true,
      steps: [emptyStep(), emptyStep()],
    });
  }

  function startEdit(s: Scenario) {
    setCreating(false);
    setEditing(s);
    setForm({
      key: s.key,
      label: s.label,
      description: s.description || "",
      active: s.active,
      steps:
        s.steps.length > 0
          ? s.steps.map((st) => ({ title: st.title, detail: st.detail }))
          : [emptyStep()],
    });
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
  }

  function updateStep(i: number, patch: Partial<ScenarioStep>) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((st, idx) => (idx === i ? { ...st, ...patch } : st)),
    }));
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, emptyStep()] }));
  }

  function removeStep(i: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.length <= 1 ? f.steps : f.steps.filter((_, idx) => idx !== i),
    }));
  }

  function moveStep(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.steps.length) return;
    setForm((f) => {
      const steps = [...f.steps];
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...f, steps };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: editing?.id,
        key: form.key || undefined,
        label: form.label,
        description: form.description,
        active: form.active,
        steps: form.steps,
      };

      const res = await fetch("/api/admin/scenarios", {
        method: creating ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      cancel();
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeScenario(s: Scenario) {
    if (
      !confirm(
        `Delete scenario “${s.label}”? Customers will no longer see it.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/scenarios?id=${s.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed");
      return;
    }
    if (editing?.id === s.id) cancel();
    await onChanged();
  }

  const showForm = creating || editing;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Troubleshooting scenarios
          </h2>
          <p className="mt-1 text-sm text-ink-soft/70">
            Each scenario (e.g. battery, screen) has DIY steps shown to
            customers before they book a repair.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="btn-primary !py-2 text-sm" onClick={startCreate}>
            Add scenario
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
        >
          <h3 className="font-semibold">
            {creating ? "New scenario" : `Edit: ${editing?.key}`}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Display label *</label>
              <input
                className="field"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Overheating / gets hot"
              />
            </div>
            {creating ? (
              <div>
                <label className="field-label">Key (optional)</label>
                <input
                  className="field"
                  value={form.key}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      key: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="auto from label if empty"
                />
              </div>
            ) : (
              <div>
                <label className="field-label">Key</label>
                <input className="field bg-fog" value={form.key} disabled />
              </div>
            )}
          </div>
          <div>
            <label className="field-label">Short description</label>
            <input
              className="field"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active (shown on customer forms)
          </label>

          <div className="border-t border-[var(--line)] pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Troubleshooting steps</p>
              <button
                type="button"
                className="text-sm font-semibold text-teal"
                onClick={addStep}
              >
                + Add step
              </button>
            </div>
            <div className="space-y-4">
              {form.steps.map((st, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--line)] bg-mist/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50">
                      Step {i + 1}
                    </span>
                    <div className="flex gap-2 text-xs font-semibold">
                      <button type="button" onClick={() => moveStep(i, -1)}>
                        ↑
                      </button>
                      <button type="button" onClick={() => moveStep(i, 1)}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => removeStep(i)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <input
                    className="field mb-2"
                    placeholder="Step title"
                    value={st.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    required
                  />
                  <textarea
                    className="field min-h-[72px]"
                    placeholder="Step details for the customer"
                    value={st.detail}
                    onChange={(e) => updateStep(i, { detail: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save scenario"}
            </button>
            <button type="button" className="btn-secondary" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{s.label}</p>
                  <span className="rounded-full bg-fog px-2 py-0.5 font-mono text-xs text-ink-soft/70">
                    {s.key}
                  </span>
                  {!s.active && (
                    <span className="rounded-full bg-amber-soft px-2 py-0.5 text-xs font-semibold text-amber">
                      Inactive
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="mt-1 text-sm text-ink-soft/70">
                    {s.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-ink-soft/50">
                  {s.steps.length} step{s.steps.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-semibold">
                <button
                  type="button"
                  className="text-teal"
                  onClick={() => startEdit(s)}
                >
                  Edit steps
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeScenario(s)}
                >
                  Delete
                </button>
              </div>
            </div>
            {!showForm && s.steps.length > 0 && (
              <ol className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
                {s.steps.map((st, i) => (
                  <li key={st.id || i} className="text-sm">
                    <span className="font-medium text-ink">
                      {i + 1}. {st.title}
                    </span>
                    <p className="mt-0.5 text-ink-soft/70">{st.detail}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
        {scenarios.length === 0 && (
          <p className="text-sm text-ink-soft/60">
            No scenarios yet — click Add scenario, or refresh to load defaults.
          </p>
        )}
      </div>
    </div>
  );
}
