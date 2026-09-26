"use client";

import { useEffect, type ReactNode } from "react";

type EstimateModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function EstimateModal({ open, onClose, children }: EstimateModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Estimate"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(12,31,28,0.45)] backdrop-blur-[3px]"
        onClick={onClose}
        aria-label="Close estimate"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_80px_rgba(12,31,28,0.22)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-mist text-lg text-ink-soft/70 transition hover:bg-fog hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
