/** Shared marketing + booking catalog (Ongofix-style coverage + FixSure trust). */

export const WARRANTY_DAYS = 90;
export const DOORSTEP_PROMISE_MINUTES = 90;

export const DEVICE_TYPES = [
  {
    id: "phone",
    label: "Mobile Phone",
    blurb: "iPhone & Android repairs",
  },
  {
    id: "tablet",
    label: "Tablet",
    blurb: "iPad & Android tablets",
  },
  {
    id: "macbook",
    label: "MacBook / Laptop",
    blurb: "Screens, batteries, ports",
  },
  {
    id: "smartwatch",
    label: "Smartwatch",
    blurb: "Apple Watch & more",
  },
] as const;

export type DeviceTypeId = (typeof DEVICE_TYPES)[number]["id"];

export const SERVICE_CATALOG = [
  {
    id: "screen",
    label: "Screen / Display Replacement",
    description: "Cracked, blank, or flickering displays",
  },
  {
    id: "glass",
    label: "Broken Display Glass",
    description: "Outer glass damage with working LCD/OLED",
  },
  {
    id: "backglass",
    label: "Back Glass Replacement",
    description: "Shattered or cracked rear glass",
  },
  {
    id: "battery",
    label: "Battery Replacement",
    description: "Drain, swelling, or sudden shutdowns",
  },
  {
    id: "charging",
    label: "Charging Port Replacement",
    description: "Loose port, slow charge, no charge",
  },
  {
    id: "camera",
    label: "Camera Repair",
    description: "Blurry lens, focus, or module issues",
  },
  {
    id: "speaker",
    label: "Speaker / Mic Repair",
    description: "Crackling, low volume, or no sound",
  },
  {
    id: "software",
    label: "Software Issues",
    description: "Boot loops, updates, performance",
  },
  {
    id: "water",
    label: "Water / Liquid Damage",
    description: "Diagnostics and board-level care",
  },
  {
    id: "other",
    label: "Other / Not sure",
    description: "Describe the issue — we’ll guide you",
  },
] as const;

export const TOP_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Vivo",
  "OnePlus",
  "Oppo",
  "Google",
  "Realme",
  "Motorola",
  "iQOO",
  "Poco",
  "Nothing",
  "Nokia",
  "Honor",
  "Asus",
  "Huawei",
] as const;

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Check price",
    text: "Pick your device and issue. Get a clear estimate with no hidden costs — locked for days when you book.",
  },
  {
    step: 2,
    title: "Book service",
    text: "Choose store visit or doorstep technician. Share your preferred time and we’ll confirm on WhatsApp.",
  },
  {
    step: 3,
    title: "Sit back & track",
    text: "Genuine parts where available, warranty on the job, and live status updates until you’re done.",
  },
] as const;

export const WHY_US = [
  {
    title: "Genuine parts focus",
    text: "Quality components and professional replacements — we tell you what’s going into your device.",
  },
  {
    title: "Transparent pricing",
    text: "Online estimate with a price lock. Final amount only after diagnosis, shown in your track timeline.",
  },
  {
    title: "Expert technicians",
    text: "Hands-on experience across phones, tablets, MacBooks, and watches.",
  },
  {
    title: "Free diagnostics path",
    text: "DIY troubleshoot first, then a clear repair quote — no pressure sales.",
  },
  {
    title: "Store or doorstep",
    text: "Visit us, or book a technician at your location when doorstep service is available.",
  },
  {
    title: `${WARRANTY_DAYS}-day warranty`,
    text: `Parts and workmanship covered for ${WARRANTY_DAYS} days on eligible repairs.`,
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Adil Khan",
    device: "iPhone 15 Pro",
    quote:
      "Professional service and genuine parts. The phone was ready on time and the track updates kept me calm.",
  },
  {
    name: "Bharath Kumar",
    device: "Google Pixel",
    quote:
      "Screen replaced quickly with a clear price upfront. Doorstep booking was easy and on time.",
  },
  {
    name: "Anisha",
    device: "Samsung Galaxy Fold",
    quote:
      "Fair pricing on a tricky fold issue. Same-day turnaround and honest communication throughout.",
  },
  {
    name: "Aaditi Srinivas",
    device: "MacBook",
    quote:
      "Cracked MacBook screen fixed and looking new again. Clear estimate and smooth store visit.",
  },
  {
    name: "Sushmita K",
    device: "iPhone",
    quote:
      "Screen and battery done fast. Privacy pledge meant I didn’t have to wipe my phone — huge plus.",
  },
] as const;

export const FAQS = [
  {
    q: "What devices do you repair?",
    a: "Mobile phones, tablets, MacBooks/laptops, and smartwatches — screens, batteries, charging ports, cameras, software, and more.",
  },
  {
    q: "Do you offer doorstep service?",
    a: "Yes. You can book a store visit or request a doorstep technician. Availability depends on area and parts — we’ll confirm after your request.",
  },
  {
    q: "How long does a repair take?",
    a: "Many common jobs (screen, battery) can be same-day when parts are in stock. Complex or board-level work may take longer — you’ll see every status on Track.",
  },
  {
    q: "Is there a warranty?",
    a: `Eligible repairs include up to ${WARRANTY_DAYS} days warranty on parts and workmanship. We’ll note coverage when your repair is completed.`,
  },
  {
    q: "How do I know the price?",
    a: "Use Check price for an instant estimate, then book. Online estimates are locked for a set number of days when you visit or schedule.",
  },
  {
    q: "Is my data safe?",
    a: "We never access photos without permission. No sign-out or factory reset required. Read our Privacy pledge for full details.",
  },
] as const;

export const SERVICE_MODES = [
  {
    id: "STORE",
    label: "Store visit",
    description: "Drop off at our counter — track every stage online.",
  },
  {
    id: "DOORSTEP",
    label: "Doorstep",
    description: "Technician visits your address at a preferred time.",
  },
] as const;

export type ServiceModeId = (typeof SERVICE_MODES)[number]["id"];
