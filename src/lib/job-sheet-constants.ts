export const DEFAULT_PRE_CHECKLIST = [
  { key: "power", label: "Powers on" },
  { key: "touch", label: "Touch / display OK" },
  { key: "camera", label: "Camera OK" },
  { key: "speaker", label: "Speaker / mic OK" },
  { key: "charging", label: "Charging OK" },
  { key: "biometrics", label: "Face ID / fingerprint OK" },
  { key: "damage", label: "Physical damage noted" },
  { key: "data", label: "Customer data acknowledged" },
] as const;

export const TECHNICIAN_OPTIONS = [
  "Store technician",
  "Senior technician",
  "Board-level specialist",
] as const;
