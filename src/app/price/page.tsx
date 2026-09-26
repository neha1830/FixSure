"use client";

import { Suspense } from "react";
import { DeviceFixFlow } from "@/components/DeviceFixFlow";
import { PageBanner } from "@/components/PageBanner";

export default function PricePage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <PageBanner
          eyebrow="Easy pricing"
          title="What can we fix?"
          image="/images/banners/banner-price.png"
          imageAlt="Phone and laptop ready for a quote"
        >
          Pick your device series and model, then tap the issue — get a clear
          ₹range and book a store visit.
        </PageBanner>
        <Suspense
          fallback={
            <p className="mt-10 text-sm text-ink-soft/60">Loading devices…</p>
          }
        >
          <DeviceFixFlow />
        </Suspense>
      </div>
    </div>
  );
}
