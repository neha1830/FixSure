export const PART_DEVICE_CATEGORIES = [
  { key: "phone", label: "Mobile phone" },
  { key: "tablet", label: "Tablet" },
  { key: "macbook", label: "Laptop / MacBook" },
  { key: "smartwatch", label: "Smartwatch" },
  { key: "other", label: "Other" },
] as const;

export type PartDeviceCategory =
  (typeof PART_DEVICE_CATEGORIES)[number]["key"];

export const PART_CATEGORY_IMAGES: Record<PartDeviceCategory, string> = {
  phone: "/images/parts/part-phone-screen.png",
  tablet: "/images/parts/part-tablet-glass.png",
  macbook: "/images/parts/part-laptop-screen.png",
  smartwatch: "/images/parts/part-watch-screen.png",
  other: "/images/parts/part-toolkit.png",
};

export const PART_QUALITIES = [
  { key: "COPY", label: "Copy / compatible" },
  { key: "OEM", label: "OEM" },
  { key: "ORIGINAL", label: "Original" },
] as const;
