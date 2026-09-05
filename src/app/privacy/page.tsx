import Link from "next/link";
import { WipeChecklist } from "@/components/WipeChecklist";
import { PRIVACY_PLEDGES } from "@/lib/privacy";

export const metadata = {
  title: "Data privacy — FixSure",
  description:
    "We never access your photos without permission. No sign-out or factory reset required.",
};

export default function PrivacyPage() {
  return (
    <div className="atmosphere min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Your data, your rules
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
          Data privacy pledge
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft/80">
          We repair hardware — we don&apos;t dig through your life. FixSure
          never accesses photos, messages, or apps without your explicit
          permission. You do not need to sign out of accounts or factory-reset
          your phone.
        </p>

        <section className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-white/90 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            What we promise
          </h2>
          <ul className="mt-5 space-y-3">
            {PRIVACY_PLEDGES.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[1.5rem] bg-fog p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Before you visit
          </h2>
          <p className="mt-2 text-sm text-ink-soft/75">
            Optional prep tips — nothing here requires signing out or wiping
            your phone.
          </p>
          <div className="mt-6">
            <WipeChecklist />
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Gallery photos
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">
            Before/after repair photos on our{" "}
            <Link href="/gallery" className="font-semibold text-teal">
              Gallery
            </Link>{" "}
            are only published when you give written consent. We crop out
            personal content and never show unlocked home screens with private
            data.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/repair" className="btn-primary">
            Book a repair
          </Link>
          <Link href="/" className="btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
