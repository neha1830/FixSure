/** Client-side headers for admin or store-technician login. */
export type AdminLoginMode = "admin" | "technician";

export function buildAdminAuthHeaders(opts: {
  mode: AdminLoginMode;
  adminPassword?: string;
  staffCode?: string;
  staffPassword?: string;
}): Record<string, string> {
  if (opts.mode === "technician") {
    return {
      "x-staff-code": String(opts.staffCode || "").trim(),
      "x-staff-password": String(opts.staffPassword || ""),
    };
  }
  return { "x-admin-password": String(opts.adminPassword || "") };
}
