export const REPAIR_STATUSES = [
  "REQUESTED",
  "RECEIVED",
  "DIAGNOSING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const STATUS_LABELS: Record<RepairStatus, string> = {
  REQUESTED: "Request received",
  RECEIVED: "Received at store",
  DIAGNOSING: "Diagnosing",
  IN_PROGRESS: "Repair in progress",
  READY: "Ready for pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Statuses that send WhatsApp to the customer when selected in admin */
export const WHATSAPP_NOTIFY_STATUSES: RepairStatus[] = [
  "RECEIVED",
  "READY",
];

export function shouldSendRepairWhatsApp(status: RepairStatus): boolean {
  return WHATSAPP_NOTIFY_STATUSES.includes(status);
}
