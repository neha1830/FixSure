import Link from "next/link";
import { WipeChecklist } from "@/components/WipeChecklist";
import { PRIVACY_PLEDGES } from "@/lib/privacy";
import { getStoreSettings } from "@/lib/store";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: `Data privacy — ${store.name}`,
    description: store.privacyBlurb,
  };
}

export default async function PrivacyPage() {
  const store = await getStoreSettings();

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
          We repair hardware — we don&apos;t dig through your life. {store.name}{" "}
          never accesses photos, messages, or apps without your explicit
          permission. You do not need to sign out of accounts or factory-reset
          your phone.
        </p>
        <p className="mt-3 text-ink-soft/75">{store.privacyBlurb}</p>

        <section className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-white/90 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            What we promise
          </h2>
          <ul className="mt-5 space-y-3">
            {PRIVACY_PLEDGES.map((p) => (
              <li
                key={p}
                className="flex gap-3 text-sm leading-relaxed text-ink-soft"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/90 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Optional wipe checklist
          </h2>
          <p className="mt-2 text-sm text-ink-soft/75">
            Not required — only if you prefer extra peace of mind.
          </p>
          <div className="mt-4">
            <WipeChecklist />
          </div>
        </section>

        <Link href="/repair" className="btn-primary mt-10">
          Book a repair
        </Link>
      </div>
    </div>
  );
}
