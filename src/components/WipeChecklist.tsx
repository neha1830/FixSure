import { WIPE_CHECKLIST } from "@/lib/privacy";

type Props = {
  compact?: boolean;
};

export function WipeChecklist({ compact = false }: Props) {
  return (
    <ol className={compact ? "space-y-3" : "space-y-5"}>
      {WIPE_CHECKLIST.map((item, i) => (
        <li key={item.title} className="flex gap-3">
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-teal font-bold text-white ${
              compact ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"
            }`}
          >
            {i + 1}
          </span>
          <div>
            <p className={`font-semibold text-ink ${compact ? "text-sm" : ""}`}>
              {item.title}
            </p>
            <p
              className={`mt-0.5 leading-relaxed text-ink-soft/75 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {item.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
