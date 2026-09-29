"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  buildAdminAuthHeaders,
  type AdminLoginMode,
} from "@/lib/admin-client-auth";
import { REPAIR_STATUSES, STATUS_LABELS, RepairStatus, WHATSAPP_NOTIFY_STATUSES } from "@/lib/store-constants";
import { ScenarioManager, Scenario } from "@/components/ScenarioManager";
import { GalleryManager, GalleryItem } from "@/components/GalleryManager";
import { ContentManager, ContentItem } from "@/components/ContentManager";
import { PartsManager, PartItem } from "@/components/PartsManager";
import { CatalogManager } from "@/components/CatalogManager";
import {
  JobSheetForm,
  JobSheetPrint,
  type JobSheetRepair,
} from "@/components/JobSheet";
import { formatEstimateDisplay } from "@/lib/pricing";
import {
  DEFAULT_STAFF_TABS,
  STAFF_TAB_OPTIONS,
  parseAllowedTabs,
  type StaffTabKey,
} from "@/lib/staff-tabs";
import {
  PHONE_INPUT_PATTERN,
  PHONE_INPUT_TITLE,
} from "@/lib/contact-validation";

type Repair = JobSheetRepair;

type Sell = {
  id: string;
  inquiryId: string;
  customerName: string;
  phoneNumber: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  estimatedPrice: number;
  actualPrice?: number | null;
  status: string;
  createdAt: string;
};

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type LeadRow = {
  key: string;
  category: "USER_QUERY" | "SELL_REQUEST";
  name: string;
  phoneNumber: string | null;
  email: string | null;
  message: string;
  status: string;
  createdAt: string;
  contactId?: string;
  sellInquiryId?: string;
};

type Review = {
  id: string;
  name: string;
  device: string | null;
  rating: number;
  body: string;
  phoneNumber: string | null;
  status: string;
  createdAt: string;
};

type Staff = {
  id: string;
  staffCode: string;
  name: string;
  active: boolean;
  allowedTabs?: string;
  createdAt: string;
  updatedAt?: string;
};

type StaffCredentials = {
  staffCode: string;
  password: string;
  name: string;
};

type WaLog = {
  id: string;
  phoneNumber: string;
  message: string;
  success: boolean;
  createdAt: string;
  relatedType: string | null;
};

type StoreForm = {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
  heroHeadline: string;
  heroSubtext: string;
  heroBadge: string;
  seoTitle: string;
  seoDescription: string;
  trustIntro: string;
  privacyBlurb: string;
  warrantyDays: string;
  doorstepMinutes: string;
  priceLockDays: string;
  doorstepFee: string;
  requestValidDays: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

const emptyStore: StoreForm = {
  name: "PhoneRepairO",
  address: "",
  phone: "",
  hours: "",
  mapsUrl: "",
  heroHeadline: "",
  heroSubtext: "",
  heroBadge: "",
  seoTitle: "",
  seoDescription: "",
  trustIntro: "",
  privacyBlurb: "",
  warrantyDays: "90",
  doorstepMinutes: "90",
  priceLockDays: "7",
  doorstepFee: "299",
  requestValidDays: "3",
  ctaPrimaryLabel: "Check price",
  ctaPrimaryHref: "/price",
  ctaSecondaryLabel: "Book repair",
  ctaSecondaryHref: "/repair",
};

export default function AdminPage() {
  const [loginMode, setLoginMode] = useState<AdminLoginMode>("admin");
  const [password, setPassword] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [sessionRole, setSessionRole] = useState<AdminLoginMode>("admin");
  const [sessionName, setSessionName] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [newTechName, setNewTechName] = useState("");
  const [newTechTabs, setNewTechTabs] = useState<StaffTabKey[]>([
    ...DEFAULT_STAFF_TABS,
  ]);
  const [editingStaffTabsId, setEditingStaffTabsId] = useState<string | null>(
    null
  );
  const [creatingTech, setCreatingTech] = useState(false);
  const [shownCredentials, setShownCredentials] =
    useState<StaffCredentials | null>(null);
  const [technicians, setTechnicians] = useState<
    { id: string; name: string }[]
  >([]);
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [repairFilter, setRepairFilter] = useState<string>("all");
  const [sellFilter, setSellFilter] = useState<string>("all");
  const [contactFilter, setContactFilter] = useState<string>("all");
  const [tab, setTab] = useState<
    | "repairs"
    | "sells"
    | "contacts"
    | "reviews"
    | "content"
    | "catalog"
    | "parts"
    | "whatsapp"
    | "settings"
    | "scenarios"
    | "gallery"
    | "technicians"
  >("repairs");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [sells, setSells] = useState<Sell[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [whatsapp, setWhatsapp] = useState<WaLog[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [storeForm, setStoreForm] = useState<StoreForm>(emptyStore);
  const [selected, setSelected] = useState<Repair | null>(null);
  const [status, setStatus] = useState("RECEIVED");
  const [finalAmount, setFinalAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendMessage, setSendMessage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Repair | null>(null);
  const [printJob, setPrintJob] = useState<Repair | null>(null);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);

  const q = listSearch.trim().toLowerCase();

  const filteredRepairs = useMemo(() => {
    let list = repairs;
    if (repairFilter === "completed") {
      list = list.filter((r) => r.status === "COMPLETED");
    } else if (repairFilter !== "all") {
      list = list.filter((r) => r.status === repairFilter);
    }
    if (!q) return list;
    return list.filter((r) =>
      [
        r.trackingId,
        r.customerName,
        r.phoneNumber,
        r.brand,
        r.model,
        r.imei,
        r.serialNumber,
        r.technicianName,
        r.issueCategory,
        r.status,
        r.deviceType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [repairs, repairFilter, q]);

  const filteredSells = useMemo(() => {
    let list = sells;
    if (sellFilter !== "all") {
      list = list.filter((s) => s.status === sellFilter);
    }
    if (!q) return list;
    return list.filter((s) =>
      [
        s.inquiryId,
        s.customerName,
        s.phoneNumber,
        s.brand,
        s.model,
        s.storage,
        s.condition,
        s.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [sells, sellFilter, q]);

  const leadRows = useMemo(() => {
    const fromContacts: LeadRow[] = contacts.map((c) => ({
      key: `contact-${c.id}`,
      category: "USER_QUERY",
      name: c.name,
      phoneNumber: c.phoneNumber,
      email: c.email,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt,
      contactId: c.id,
    }));
    const fromSells: LeadRow[] = sells.map((s) => ({
      key: `sell-${s.id}`,
      category: "SELL_REQUEST",
      name: s.customerName,
      phoneNumber: s.phoneNumber,
      email: null,
      message: `${s.brand} ${s.model} · ${s.storage} · ${s.condition} · est. ₹${s.estimatedPrice.toLocaleString("en-IN")}`,
      status: s.status,
      createdAt: s.createdAt,
      sellInquiryId: s.inquiryId,
    }));
    return [...fromContacts, ...fromSells].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contacts, sells]);

  const filteredLeads = useMemo(() => {
    let list = leadRows;
    if (contactFilter === "USER_QUERY" || contactFilter === "SELL_REQUEST") {
      list = list.filter((c) => c.category === contactFilter);
    } else if (contactFilter !== "all") {
      list = list.filter((c) => c.status === contactFilter);
    }
    if (!q) return list;
    return list.filter((c) =>
      [
        c.name,
        c.email,
        c.phoneNumber,
        c.message,
        c.status,
        c.category === "SELL_REQUEST" ? "sell request" : "user query",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leadRows, contactFilter, q]);

  const showSellActualColumn = useMemo(
    () => sells.some((s) => s.status !== "ESTIMATED"),
    [sells]
  );

  const requestHeaders = useMemo(
    () =>
      buildAdminAuthHeaders({
        mode: loginMode,
        adminPassword: password,
        staffCode,
        staffPassword,
      }),
    [loginMode, password, staffCode, staffPassword]
  );

  async function load(opts?: { refresh?: boolean; mode?: AdminLoginMode }) {
    const mode = opts?.mode ?? loginMode;
    if (opts?.refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const headers = buildAdminAuthHeaders({
        mode,
        adminPassword: password,
        staffCode,
        staffPassword,
      });
      const res = await fetch("/api/admin", { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error(
          data.error || `Login failed (${res.status}). Try restarting the app.`
        );
      }
      const data = await res.json();
      setRepairs(data.repairs);
      setSells(data.sells);
      setContacts(data.contacts || []);
      setReviews(data.reviews || []);
      setContent(data.content || []);
      setParts(data.parts || []);
      setWhatsapp(data.whatsapp);
      setScenarios(data.scenarios || []);
      setGallery(data.gallery || []);
      setStaffList(data.staff || []);
      setTechnicians(data.technicians || []);
      if (data.session?.role) {
        setSessionRole(data.session.role);
        setSessionName(data.session.staffName || "");
        if (data.session.role === "technician") {
          const tabs = data.session.allowedTabs || DEFAULT_STAFF_TABS;
          setAllowedTabs(tabs);
          setTab((prev) =>
            tabs.includes(prev) ? prev : (tabs[0] as typeof prev) || "repairs"
          );
        } else {
          setAllowedTabs([]);
        }
      }
      if (data.store) {
        setStoreForm({
          ...emptyStore,
          name: data.store.name || "PhoneRepairO",
          address: data.store.address || "",
          phone: data.store.phone || "",
          hours: data.store.hours || "",
          mapsUrl: data.store.mapsUrl || "",
          heroHeadline: data.store.heroHeadline || "",
          heroSubtext: data.store.heroSubtext || "",
          heroBadge: data.store.heroBadge || "",
          seoTitle: data.store.seoTitle || "",
          seoDescription: data.store.seoDescription || "",
          trustIntro: data.store.trustIntro || "",
          privacyBlurb: data.store.privacyBlurb || "",
          warrantyDays: String(data.store.warrantyDays ?? 90),
          doorstepMinutes: String(data.store.doorstepMinutes ?? 90),
          priceLockDays: String(data.store.priceLockDays ?? 7),
          doorstepFee: String(data.store.doorstepFee ?? 299),
          requestValidDays: String(data.store.requestValidDays ?? 3),
          ctaPrimaryLabel: data.store.ctaPrimaryLabel || "Check price",
          ctaPrimaryHref: data.store.ctaPrimaryHref || "/price",
          ctaSecondaryLabel: data.store.ctaSecondaryLabel || "Book repair",
          ctaSecondaryHref: data.store.ctaSecondaryHref || "/repair",
        });
      }
      setAuthed(true);
      setLoginMode(mode);
    } catch (err) {
      alert(
        err instanceof Error && err.message !== "Unauthorized"
          ? err.message
          : mode === "technician"
            ? "Wrong ID or password"
            : "Wrong password"
      );
      setAuthed(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    load({ mode: loginMode });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthed(false);
    setPassword("");
    setStaffPassword("");
    setSessionName("");
  }

  function openRepair(r: Repair) {
    setSelected(r);
    const next = r.status === "REQUESTED" ? "RECEIVED" : r.status;
    setStatus(next);
    setFinalAmount(r.finalAmount?.toString() || "");
    setAdminNotes(r.adminNotes || "");
    setSendMessage(
      WHATSAPP_NOTIFY_STATUSES.includes(next as RepairStatus)
    );
  }

  async function saveUpdate(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          trackingId: selected.trackingId,
          status,
          finalAmount: finalAmount === "" ? null : Number(finalAmount),
          adminNotes,
          sendMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
      setSelected(null);
      alert(
        sendMessage
          ? "Updated and WhatsApp notification queued."
          : "Updated without WhatsApp."
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function updateSellStatus(
    inquiryId: string,
    next: string,
    actualPrice?: number | null
  ) {
    const res = await fetch("/api/admin/sell", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      body: JSON.stringify({
        inquiryId,
        status: next,
        ...(actualPrice !== undefined ? { actualPrice } : {}),
      }),
    });
    if (!res.ok) {
      alert("Could not update sell inquiry");
      return;
    }
    await load();
  }

  async function updateSellActual(inquiryId: string, actualPrice: number | null) {
    const res = await fetch("/api/admin/sell", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      body: JSON.stringify({ inquiryId, actualPrice }),
    });
    if (!res.ok) {
      alert("Could not update actual price");
      return;
    }
    await load({ refresh: true });
  }

  async function saveStore(e: FormEvent) {
    e.preventDefault();
    setSavingStore(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          ...storeForm,
          warrantyDays: Number(storeForm.warrantyDays),
          doorstepMinutes: Number(storeForm.doorstepMinutes),
          priceLockDays: Number(storeForm.priceLockDays),
          doorstepFee: Number(storeForm.doorstepFee),
          requestValidDays: Number(storeForm.requestValidDays),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Site settings saved. They now appear across the website.");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSavingStore(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassword(pwForm.newPassword);
      setPwForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert(data.message || "Password updated.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setSavingPw(false);
    }
  }

  if (!authed) {
    return (
      <div className="atmosphere flex min-h-[70vh] items-center justify-center px-5">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]"
        >
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Admin
          </h1>
          <p className="mt-2 text-sm text-ink-soft/70">
            Owner password or store technician 6-digit ID.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setLoginMode("admin")}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                loginMode === "admin"
                  ? "bg-teal text-white"
                  : "border border-[var(--line)] bg-white text-ink-soft"
              }`}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("technician")}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                loginMode === "technician"
                  ? "bg-teal text-white"
                  : "border border-[var(--line)] bg-white text-ink-soft"
              }`}
            >
              Technician
            </button>
          </div>
          {loginMode === "admin" ? (
            <>
              <label className="field-label mt-6">Password</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
              />
            </>
          ) : (
            <>
              <label className="field-label mt-6">6-digit ID</label>
              <input
                className="field"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={staffCode}
                onChange={(e) =>
                  setStaffCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                required
              />
              <label className="field-label mt-4">Password</label>
              <input
                className="field"
                type="password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </>
          )}
          <button
            type="submit"
            className="btn-primary mt-5 w-full"
            disabled={loading}
          >
            {loading ? "Checking…" : "Enter dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              PhoneRepairO admin
            </h1>
            <p className="mt-1 text-sm text-ink-soft/70">
              {repairs.length} repairs · {sells.length} sell ·{" "}
              {contacts.length} contacts · {reviews.length} reviews
              {sessionRole === "technician" && sessionName
                ? ` · signed in as ${sessionName}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 !py-2 text-sm"
              disabled={refreshing || loading}
              onClick={() => load({ refresh: true })}
            >
              {refreshing ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
                  Refreshing…
                </>
              ) : (
                "Refresh"
              )}
            </button>
            <button
              type="button"
              className="btn-secondary !py-2 text-sm"
              onClick={() => logout()}
            >
              Log out
            </button>
          </div>
        </div>

        {refreshing && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-teal/20 bg-mint/30 px-4 py-2 text-sm font-medium text-teal-deep">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Reloading dashboard data…
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["repairs", "Repairs"],
              ["sells", "Sell inquiries"],
              ["contacts", "Contact leads"],
              ["reviews", "Reviews"],
              ["content", "Website content"],
              ["catalog", "Devices"],
              ["parts", "Parts shop"],
              ["scenarios", "Troubleshoot"],
              ["gallery", "Gallery"],
              ["technicians", "Technicians"],
              ["whatsapp", "WhatsApp log"],
              ["settings", "Site settings"],
            ] as const
          )
            .filter(([key]) => {
              if (key === "technicians" || key === "settings") {
                return sessionRole === "admin";
              }
              if (sessionRole === "admin") return true;
              return allowedTabs.includes(key);
            })
            .map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === key
                  ? "bg-teal text-white"
                  : "bg-white text-ink-soft border border-[var(--line)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "repairs" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["REQUESTED", "Requested"],
                    ["RECEIVED", "Received"],
                    ["DIAGNOSING", "Diagnosing"],
                    ["IN_PROGRESS", "In progress"],
                    ["READY", "Ready"],
                    ["completed", "Completed"],
                    ["CANCELLED", "Cancelled"],
                  ] as const
                ).map(([key, label]) => {
                  const count =
                    key === "all"
                      ? repairs.length
                      : key === "completed"
                        ? repairs.filter((r) => r.status === "COMPLETED")
                            .length
                        : repairs.filter((r) => r.status === key).length;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRepairFilter(key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        repairFilter === key
                          ? "bg-teal text-white"
                          : "border border-[var(--line)] bg-white"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-primary !py-2 text-sm"
                onClick={() => {
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
              >
                Add job sheet
              </button>
            </div>
            <input
              className="field"
              type="search"
              placeholder="Search repairs — name, phone, brand, model, IMEI, tracking ID, technician…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />

            <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-fog/80 text-xs uppercase text-ink-soft/60">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Technician</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepairs.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--line)]">
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.trackingId}
                      </td>
                      <td className="px-4 py-3">
                        <div>{r.customerName}</div>
                        <div className="text-xs text-ink-soft/60">
                          {r.phoneNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.brand} {r.model}
                        <div className="text-xs text-ink-soft/60">
                          {r.deviceType || "phone"}
                          {r.dueDate ? ` · due ${r.dueDate}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-soft/75">
                        {r.technicianName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-mint/50 px-2 py-1 text-xs font-semibold text-teal-deep">
                          {STATUS_LABELS[r.status as RepairStatus] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.finalAmount != null
                          ? `₹${r.finalAmount.toLocaleString("en-IN")}`
                          : formatEstimateDisplay(
                              r.estimatedCharge,
                              r.estimatedChargeMax
                            )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-sm font-semibold text-teal hover:underline"
                            onClick={() => setPrintJob(r)}
                          >
                            Job sheet
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-amber-soft px-3 py-1 text-sm font-bold text-amber underline-offset-2 hover:underline"
                            onClick={() => openRepair(r)}
                          >
                            Status →
                          </button>
                          <button
                            type="button"
                            className="text-sm font-semibold text-ink-soft hover:text-teal hover:underline"
                            onClick={() => {
                              setEditingJob(r);
                              setShowJobForm(true);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRepairs.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-ink-soft/60"
                      >
                        {q
                          ? "No repairs match your search."
                          : repairFilter === "completed"
                            ? "No completed jobs yet."
                            : "No jobs in this filter. Click Add job sheet for a walk-in."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "sells" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["ESTIMATED", "Estimated"],
                  ["VISITED", "Visited"],
                  ["PURCHASED", "Purchased"],
                  ["DECLINED", "Declined"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSellFilter(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    sellFilter === key
                      ? "bg-teal text-white"
                      : "border border-[var(--line)] bg-white"
                  }`}
                >
                  {label} (
                  {key === "all"
                    ? sells.length
                    : sells.filter((s) => s.status === key).length}
                  )
                </button>
              ))}
            </div>
            <input
              className="field"
              type="search"
              placeholder="Search sell inquiries — name, phone, brand, model, status…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />
            <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-fog/80 text-xs uppercase text-ink-soft/60">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Estimate</th>
                  {showSellActualColumn && (
                    <th className="px-4 py-3">Actual</th>
                  )}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSells.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--line)]">
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.inquiryId}
                    </td>
                    <td className="px-4 py-3">
                      {s.customerName}
                      <div className="text-xs text-ink-soft/60">
                        {s.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.brand} {s.model} · {s.storage}
                      <div className="text-xs text-ink-soft/60">
                        {s.condition}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{s.estimatedPrice.toLocaleString("en-IN")}
                    </td>
                    {showSellActualColumn && (
                      <td className="px-4 py-3">
                        {s.status === "ESTIMATED" ? (
                          <span className="text-ink-soft/40">—</span>
                        ) : (
                          <input
                            className="field !w-28 !py-1 text-xs"
                            type="number"
                            min={0}
                            placeholder="Actual ₹"
                            defaultValue={
                              s.actualPrice != null ? s.actualPrice : ""
                            }
                            key={`${s.id}-${s.actualPrice ?? "x"}-${s.status}`}
                            onBlur={(e) => {
                              const raw = e.target.value.trim();
                              const next =
                                raw === "" ? null : Number(raw);
                              if (
                                next !== null &&
                                (!Number.isFinite(next) || next < 0)
                              ) {
                                alert("Enter a valid actual price");
                                return;
                              }
                              if ((s.actualPrice ?? null) === next) return;
                              updateSellActual(s.inquiryId, next);
                            }}
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">{s.status}</td>
                    <td className="px-4 py-3">
                      <select
                        className="field !py-1.5 text-xs"
                        value={s.status}
                        onChange={(e) =>
                          updateSellStatus(s.inquiryId, e.target.value)
                        }
                      >
                        <option value="ESTIMATED">ESTIMATED</option>
                        <option value="VISITED">VISITED</option>
                        <option value="PURCHASED">PURCHASED</option>
                        <option value="DECLINED">DECLINED</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredSells.length === 0 && (
                  <tr>
                    <td
                      colSpan={showSellActualColumn ? 7 : 6}
                      className="px-4 py-10 text-center text-ink-soft/60"
                    >
                      {q
                        ? "No sell inquiries match your search."
                        : "No sell inquiries yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {tab === "contacts" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["USER_QUERY", "User query"],
                  ["SELL_REQUEST", "Sell request"],
                  ["NEW", "New"],
                  ["REPLIED", "Replied"],
                  ["CLOSED", "Closed"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setContactFilter(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    contactFilter === key
                      ? "bg-teal text-white"
                      : "border border-[var(--line)] bg-white"
                  }`}
                >
                  {label} (
                  {key === "all"
                    ? leadRows.length
                    : key === "USER_QUERY" || key === "SELL_REQUEST"
                      ? leadRows.filter((c) => c.category === key).length
                      : leadRows.filter((c) => c.status === key).length}
                  )
                </button>
              ))}
            </div>
            <input
              className="field"
              type="search"
              placeholder="Search leads — name, phone, email, message, category…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
            />
            <div className="space-y-3">
            {filteredLeads.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {c.name}{" "}
                      <span className="ml-2 rounded-full bg-mint/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-deep">
                        {c.category === "SELL_REQUEST"
                          ? "Sell request"
                          : "User query"}
                      </span>
                    </p>
                    <p className="text-xs text-ink-soft/60">
                      {c.phoneNumber || "—"} · {c.email || "—"} ·{" "}
                      {new Date(c.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {c.contactId ? (
                    <select
                      className="field !w-auto !py-1.5 text-xs"
                      value={c.status}
                      onChange={async (e) => {
                        const res = await fetch("/api/admin/contact", {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            ...requestHeaders,
                          },
                          body: JSON.stringify({
                            id: c.contactId,
                            status: e.target.value,
                          }),
                        });
                        if (!res.ok) alert("Could not update");
                        else await load({ refresh: true });
                      }}
                    >
                      <option value="NEW">NEW</option>
                      <option value="REPLIED">REPLIED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  ) : c.sellInquiryId ? (
                    <select
                      className="field !w-auto !py-1.5 text-xs"
                      value={c.status}
                      onChange={(e) =>
                        updateSellStatus(c.sellInquiryId!, e.target.value)
                      }
                    >
                      <option value="ESTIMATED">ESTIMATED</option>
                      <option value="VISITED">VISITED</option>
                      <option value="PURCHASED">PURCHASED</option>
                      <option value="DECLINED">DECLINED</option>
                    </select>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-ink-soft">
                  {c.message}
                </p>
              </div>
            ))}
            {filteredLeads.length === 0 && (
              <p className="text-sm text-ink-soft/60">
                {q
                  ? "No contact leads match your search."
                  : "No leads yet."}
              </p>
            )}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-6 space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.name}{" "}
                      <span className="font-normal text-amber">
                        {"★".repeat(r.rating)}
                      </span>
                    </p>
                    <p className="text-xs text-ink-soft/60">
                      {r.device || "—"} · {r.phoneNumber || "—"} · {r.status} ·{" "}
                      {new Date(r.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="field !w-auto !py-1.5 text-xs"
                      value={r.status}
                      onChange={async (e) => {
                        const res = await fetch("/api/admin/review", {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            ...requestHeaders,
                          },
                          body: JSON.stringify({
                            id: r.id,
                            status: e.target.value,
                          }),
                        });
                        if (!res.ok) alert("Could not update");
                        else await load();
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <button
                      type="button"
                      className="text-xs font-semibold text-amber"
                      onClick={async () => {
                        if (!confirm("Delete review?")) return;
                        await fetch(
                          `/api/admin/review?id=${encodeURIComponent(r.id)}`,
                          {
                            method: "DELETE",
                            headers: { ...requestHeaders },
                          }
                        );
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-ink-soft">{r.body}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-ink-soft/60">
                No customer reviews yet. They submit at /reviews.
              </p>
            )}
          </div>
        )}

        {tab === "content" && (
          <ContentManager
            authHeaders={requestHeaders}
            items={content}
            onChanged={() => load()}
          />
        )}

        {tab === "catalog" && (
          <CatalogManager authHeaders={requestHeaders} />
        )}

        {tab === "parts" && (
          <div className="mt-6">
            <PartsManager
              authHeaders={requestHeaders}
              parts={parts}
              onChanged={() => load()}
            />
          </div>
        )}

        {tab === "scenarios" && (
          <ScenarioManager
            authHeaders={requestHeaders}
            scenarios={scenarios}
            onChanged={() => load()}
          />
        )}

        {tab === "gallery" && (
          <GalleryManager
            authHeaders={requestHeaders}
            items={gallery}
            onChanged={() => load()}
          />
        )}

        {tab === "whatsapp" && (
          <div className="mt-6 space-y-3">
            {whatsapp.map((w) => (
              <div
                key={w.id}
                className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-soft/60">
                  <span>
                    {w.phoneNumber} · {w.relatedType || "general"}
                  </span>
                  <span>
                    {new Date(w.createdAt).toLocaleString("en-IN")} ·{" "}
                    {w.success ? "sent/logged" : "failed"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-ink-soft">
                  {w.message}
                </p>
              </div>
            ))}
            {whatsapp.length === 0 && (
              <p className="text-sm text-ink-soft/60">No messages yet.</p>
            )}
          </div>
        )}

        {tab === "technicians" && sessionRole === "admin" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                Add store technician
              </h2>
              <p className="mt-1 text-sm text-ink-soft/70">
                Creates a 6-digit login ID and password you can hand to the
                technician. Passwords are shown once — copy them before closing.
              </p>
              <form
                className="mt-4 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newTechName.trim()) return;
                  if (newTechTabs.length === 0) {
                    alert("Select at least one tab for access.");
                    return;
                  }
                  setCreatingTech(true);
                  try {
                    const res = await fetch("/api/admin/staff", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...requestHeaders,
                      },
                      body: JSON.stringify({
                        name: newTechName.trim(),
                        allowedTabs: newTechTabs,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      if (data.suggestion) {
                        setNewTechName(data.suggestion);
                        throw new Error(
                          data.error ||
                            `Name already exists. Suggested: ${data.suggestion}`
                        );
                      }
                      throw new Error(data.error || "Failed");
                    }
                    setShownCredentials(data.credentials);
                    setNewTechName("");
                    setNewTechTabs([...DEFAULT_STAFF_TABS]);
                    await load({ refresh: true });
                  } catch (err) {
                    alert(
                      err instanceof Error
                        ? err.message
                        : "Could not create technician"
                    );
                  } finally {
                    setCreatingTech(false);
                  }
                }}
              >
                <div className="min-w-[220px] max-w-md">
                  <label className="field-label">Technician name</label>
                  <input
                    className="field"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                  <p className="mt-1 text-xs text-ink-soft/60">
                    Names must be unique. If taken, use Rahul Sharma1, etc.
                  </p>
                </div>
                <div>
                  <p className="field-label">Tab access</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STAFF_TAB_OPTIONS.map((opt) => {
                      const on = newTechTabs.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setNewTechTabs((prev) =>
                              on
                                ? prev.filter((k) => k !== opt.key)
                                : [...prev, opt.key]
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            on
                              ? "bg-teal text-white"
                              : "border border-[var(--line)] bg-white text-ink-soft"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creatingTech}
                >
                  {creatingTech ? "Creating…" : "Create access"}
                </button>
              </form>
            </div>

            {shownCredentials && (
              <div className="rounded-2xl border border-teal/30 bg-mint/40 p-6">
                <h3 className="font-semibold text-teal-deep">
                  Give these to {shownCredentials.name}
                </h3>
                <p className="mt-3 text-sm">
                  <span className="text-ink-soft/70">6-digit ID:</span>{" "}
                  <span className="font-mono text-lg font-bold tracking-widest">
                    {shownCredentials.staffCode}
                  </span>
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-ink-soft/70">Password:</span>{" "}
                  <span className="font-mono text-lg font-bold">
                    {shownCredentials.password}
                  </span>
                </p>
                <p className="mt-3 text-xs text-ink-soft/60">
                  They sign in at /admin → Technician tab with this ID and
                  password.
                </p>
                <button
                  type="button"
                  className="btn-secondary mt-4 !py-2 text-sm"
                  onClick={() => setShownCredentials(null)}
                >
                  Done — I copied these
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-mist/50 text-xs uppercase tracking-wide text-ink-soft/60">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tabs</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => {
                    const tabs = parseAllowedTabs(s.allowedTabs);
                    return (
                    <tr
                      key={s.id}
                      className="border-b border-[var(--line)] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 font-mono tracking-wider">
                        {s.staffCode}
                      </td>
                      <td className="px-4 py-3">
                        {editingStaffTabsId === s.id ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {STAFF_TAB_OPTIONS.map((opt) => {
                                const on = tabs.includes(opt.key);
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                      on
                                        ? "bg-teal text-white"
                                        : "border border-[var(--line)] bg-white"
                                    }`}
                                    onClick={async () => {
                                      const next = on
                                        ? tabs.filter((k) => k !== opt.key)
                                        : [...tabs, opt.key];
                                      if (next.length === 0) {
                                        alert("Keep at least one tab.");
                                        return;
                                      }
                                      const res = await fetch(
                                        "/api/admin/staff",
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                            ...requestHeaders,
                                          },
                                          body: JSON.stringify({
                                            id: s.id,
                                            allowedTabs: next,
                                          }),
                                        }
                                      );
                                      if (!res.ok) {
                                        alert("Could not update tabs");
                                        return;
                                      }
                                      await load({ refresh: true });
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              className="text-xs font-semibold text-ink-soft underline"
                              onClick={() => setEditingStaffTabsId(null)}
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-soft/70">
                            {tabs
                              .map(
                                (k) =>
                                  STAFF_TAB_OPTIONS.find((t) => t.key === k)
                                    ?.label || k
                              )
                              .join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.active ? (
                          <span className="text-teal-deep">Active</span>
                        ) : (
                          <span className="text-ink-soft/50">Disabled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold text-teal underline"
                            onClick={() =>
                              setEditingStaffTabsId(
                                editingStaffTabsId === s.id ? null : s.id
                              )
                            }
                          >
                            Edit tabs
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-teal underline"
                            onClick={async () => {
                              const res = await fetch("/api/admin/staff", {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  ...requestHeaders,
                                },
                                body: JSON.stringify({
                                  id: s.id,
                                  resetPassword: true,
                                }),
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                alert(data.error || "Reset failed");
                                return;
                              }
                              if (data.credentials) {
                                setShownCredentials(data.credentials);
                              }
                              await load({ refresh: true });
                            }}
                          >
                            Reset password
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-ink-soft underline"
                            onClick={async () => {
                              const res = await fetch("/api/admin/staff", {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  ...requestHeaders,
                                },
                                body: JSON.stringify({
                                  id: s.id,
                                  active: !s.active,
                                }),
                              });
                              if (!res.ok) {
                                const data = await res.json();
                                alert(data.error || "Update failed");
                                return;
                              }
                              await load({ refresh: true });
                            }}
                          >
                            {s.active ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {staffList.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-ink-soft/60"
                      >
                        No technicians yet — create one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && sessionRole === "admin" && (
          <div className="mt-6 max-w-2xl space-y-6">
            <form
              onSubmit={saveStore}
              className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                  Brand &amp; store
                </h2>
                <p className="mt-1 text-sm text-ink-soft/70">
                  Website name (e.g. PhoneRepairO), address, and contact —
                  shown in header, footer, and messages.
                </p>
              </div>
              <div>
                <label className="field-label">Website / brand name *</label>
                <input
                  className="field"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="field-label">Address *</label>
                <textarea
                  className="field min-h-[80px]"
                  value={storeForm.address}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, address: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="field-label">Phone / WhatsApp *</label>
                <input
                  className="field"
                  type="tel"
                  inputMode="numeric"
                  pattern={PHONE_INPUT_PATTERN}
                  title={PHONE_INPUT_TITLE}
                  placeholder="10-digit mobile"
                  value={storeForm.phone}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="field-label">Hours</label>
                <input
                  className="field"
                  value={storeForm.hours}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, hours: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Google Maps link</label>
                <input
                  className="field"
                  value={storeForm.mapsUrl}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, mapsUrl: e.target.value })
                  }
                />
              </div>

              <hr className="border-[var(--line)]" />
              <h3 className="font-semibold">Homepage hero</h3>
              <div>
                <label className="field-label">Headline</label>
                <textarea
                  className="field min-h-[60px]"
                  value={storeForm.heroHeadline}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, heroHeadline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Supporting text</label>
                <textarea
                  className="field min-h-[80px]"
                  value={storeForm.heroSubtext}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, heroSubtext: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Badge line</label>
                <input
                  className="field"
                  value={storeForm.heroBadge}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, heroBadge: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label">Primary CTA label</label>
                  <input
                    className="field"
                    value={storeForm.ctaPrimaryLabel}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        ctaPrimaryLabel: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Primary CTA link</label>
                  <input
                    className="field"
                    value={storeForm.ctaPrimaryHref}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        ctaPrimaryHref: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Secondary CTA label</label>
                  <input
                    className="field"
                    value={storeForm.ctaSecondaryLabel}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        ctaSecondaryLabel: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Secondary CTA link</label>
                  <input
                    className="field"
                    value={storeForm.ctaSecondaryHref}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        ctaSecondaryHref: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <hr className="border-[var(--line)]" />
              <h3 className="font-semibold">SEO &amp; copy</h3>
              <div>
                <label className="field-label">Browser tab title</label>
                <input
                  className="field"
                  value={storeForm.seoTitle}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, seoTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">SEO description</label>
                <textarea
                  className="field min-h-[60px]"
                  value={storeForm.seoDescription}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      seoDescription: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="field-label">Trust section intro</label>
                <textarea
                  className="field min-h-[60px]"
                  value={storeForm.trustIntro}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, trustIntro: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Privacy blurb</label>
                <textarea
                  className="field min-h-[60px]"
                  value={storeForm.privacyBlurb}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, privacyBlurb: e.target.value })
                  }
                />
              </div>

              <hr className="border-[var(--line)]" />
              <h3 className="font-semibold">Pricing &amp; visit rules</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label">Warranty days</label>
                  <input
                    className="field"
                    type="number"
                    value={storeForm.warrantyDays}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        warrantyDays: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">
                    Request valid days (bring phone by)
                  </label>
                  <input
                    className="field"
                    type="number"
                    value={storeForm.requestValidDays}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        requestValidDays: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Price lock (days)</label>
                  <input
                    className="field"
                    type="number"
                    value={storeForm.priceLockDays}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        priceLockDays: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={savingStore}
              >
                {savingStore ? "Saving…" : "Save site settings"}
              </button>
            </form>

            <form
              onSubmit={savePassword}
              className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                  Change admin password
                </h2>
                <p className="mt-1 text-sm text-ink-soft/70">
                  Password is stored in the database only (not in .env). Default
                  on first setup is{" "}
                  <span className="font-mono text-xs">fixsure-admin</span> —
                  change it here after login. Bookmark{" "}
                  <span className="font-mono text-xs">/admin</span> yourself —
                  the link is hidden from customers.
                </p>
              </div>
              <div>
                <label className="field-label">Current password</label>
                <input
                  className="field"
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, currentPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">New password</label>
                <input
                  className="field"
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label">Confirm new password</label>
                <input
                  className="field"
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, confirmPassword: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary" disabled={savingPw}>
                {savingPw ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form
            onSubmit={saveUpdate}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Update {selected.trackingId}
            </h2>
            <p className="mt-1 text-sm text-ink-soft/70">
              {selected.customerName} · {selected.brand} {selected.model} ·{" "}
              {selected.deviceType || "phone"}
            </p>
            <p className="mt-2 text-xs font-semibold text-teal">
              Store visit
            </p>
            <p className="mt-3 text-sm text-ink-soft/80">
              {selected.issueDescription}
            </p>

            <label className="field-label mt-5">Status</label>
            <select
              className="field"
              value={status}
              onChange={(e) => {
                const next = e.target.value;
                setStatus(next);
                setSendMessage(
                  WHATSAPP_NOTIFY_STATUSES.includes(next as RepairStatus)
                );
              }}
            >
              {REPAIR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <label className="field-label mt-4">
              Final / confirmed amount (₹)
            </label>
            <input
              className="field"
              type="number"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              placeholder={`Estimate ${formatEstimateDisplay(selected.estimatedCharge, selected.estimatedChargeMax)}`}
            />

            <div className="mt-3">
              <button
                type="button"
                className="text-sm font-semibold text-teal"
                onClick={() => {
                  setPrintJob(selected);
                  setSelected(null);
                }}
              >
                Open full job sheet
              </button>
            </div>

            <label className="field-label mt-4">Admin notes</label>
            <textarea
              className="field min-h-[80px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={sendMessage}
                disabled={
                  !WHATSAPP_NOTIFY_STATUSES.includes(status as RepairStatus)
                }
                onChange={(e) => setSendMessage(e.target.checked)}
              />
              <span>
                Send WhatsApp update
                {WHATSAPP_NOTIFY_STATUSES.includes(status as RepairStatus)
                  ? " (allowed for “submitted” / “ready” only)"
                  : " — only when status is Received or Ready"}
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save & notify"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {(showJobForm || editingJob) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <JobSheetForm
            authHeaders={requestHeaders}
            technicians={technicians}
            storeName={storeForm.name}
            storePhone={storeForm.phone}
            storeAddress={storeForm.address}
            initial={editingJob}
            onCancel={() => {
              setShowJobForm(false);
              setEditingJob(null);
            }}
            onCreated={async () => {
              setShowJobForm(false);
              setEditingJob(null);
              await load();
            }}
          />
        </div>
      )}

      {printJob && (
        <JobSheetPrint
          repair={printJob}
          storeName={storeForm.name}
          storePhone={storeForm.phone}
          storeAddress={storeForm.address}
          onClose={() => setPrintJob(null)}
          onEdit={() => {
            setEditingJob(printJob);
            setPrintJob(null);
            setShowJobForm(false);
          }}
        />
      )}
    </div>
  );
}
