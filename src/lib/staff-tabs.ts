/** Tabs a store technician may be granted (owner always sees all). */
export const STAFF_TAB_OPTIONS = [
  { key: "repairs", label: "Repairs" },
  { key: "sells", label: "Sell inquiries" },
  { key: "contacts", label: "Contact leads" },
  { key: "reviews", label: "Reviews" },
  { key: "content", label: "Website content" },
  { key: "catalog", label: "Devices" },
  { key: "parts", label: "Parts shop" },
  { key: "scenarios", label: "Troubleshoot" },
  { key: "gallery", label: "Gallery" },
  { key: "whatsapp", label: "WhatsApp log" },
] as const;

export type StaffTabKey = (typeof STAFF_TAB_OPTIONS)[number]["key"];

export const DEFAULT_STAFF_TABS: StaffTabKey[] = [
  "repairs",
  "sells",
  "contacts",
];

export function parseAllowedTabs(raw: string | null | undefined): StaffTabKey[] {
  const allowed = new Set(STAFF_TAB_OPTIONS.map((t) => t.key));
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [...DEFAULT_STAFF_TABS];
    const keys = parsed
      .map((x) => String(x))
      .filter((k): k is StaffTabKey => allowed.has(k as StaffTabKey));
    return keys.length ? keys : [...DEFAULT_STAFF_TABS];
  } catch {
    return [...DEFAULT_STAFF_TABS];
  }
}

export function serializeAllowedTabs(tabs: string[]): string {
  const allowed = new Set(STAFF_TAB_OPTIONS.map((t) => t.key));
  const keys = tabs.filter((k) => allowed.has(k as StaffTabKey));
  return JSON.stringify(keys.length ? keys : DEFAULT_STAFF_TABS);
}
