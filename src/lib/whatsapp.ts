import { prisma } from "./db";

type SendOpts = {
  phoneNumber: string;
  /** Plain text — used in mock mode, admin log, and as fallback Body when no template is set */
  message: string;
  relatedType?: string;
  relatedId?: string;
  /**
   * Twilio Content Template SID (HX…). Required for messaging real customers
   * who have not messaged you first (business-initiated WhatsApp).
   */
  contentSid?: string;
  /** Template variables as {"1":"value","2":"value"} for {{1}} {{2}} in the template */
  contentVariables?: Record<string, string>;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

export function getRepairTemplateSid(): string | undefined {
  return (
    process.env.TWILIO_TEMPLATE_REPAIR_UPDATE ||
    process.env.TWILIO_CONTENT_SID ||
    undefined
  );
}

/**
 * Sends WhatsApp via Twilio.
 * - mock: logs only
 * - live + ContentSid: uses Meta-approved template (needed for real customers)
 * - live without ContentSid: free-form Body (only works in sandbox / 24h session)
 */
export async function sendWhatsApp({
  phoneNumber,
  message,
  relatedType,
  relatedId,
  contentSid,
  contentVariables,
}: SendOpts): Promise<{ success: boolean; mode: string; detail?: string }> {
  const to = normalizePhone(phoneNumber);
  const mode = process.env.WHATSAPP_MODE || "mock";
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || "";

  let success = true;
  let detail: string | undefined;

  if (mode === "live" && sid && token && from) {
    try {
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const params = new URLSearchParams({
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        To: `whatsapp:${to}`,
      });

      if (contentSid) {
        params.set("ContentSid", contentSid);
        if (contentVariables && Object.keys(contentVariables).length > 0) {
          params.set("ContentVariables", JSON.stringify(contentVariables));
        }
      } else {
        // Free-form only works after the customer messages you, or in sandbox
        params.set("Body", message);
        detail =
          "Sent as free-form text. For real customers, set TWILIO_TEMPLATE_* Content SIDs.";
      }

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );
      const text = await res.text();
      success = res.ok;
      if (!success) {
        console.error("Twilio error", text);
        detail = text.slice(0, 500);
      }
    } catch (err) {
      console.error("WhatsApp send failed", err);
      success = false;
      detail = err instanceof Error ? err.message : "send failed";
    }
  } else {
    console.log(
      `[WhatsApp:${mode}] → ${to}${contentSid ? ` template=${contentSid}` : ""}\n${message}\n`
    );
    if (mode === "live" && (!sid || !token || !from)) {
      detail = "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM";
      success = false;
    }
  }

  await prisma.whatsAppLog.create({
    data: {
      phoneNumber: to,
      message: contentSid
        ? `[template:${contentSid}] ${message}`
        : message,
      relatedType,
      relatedId,
      success,
    },
  });

  return { success, mode, detail };
}
