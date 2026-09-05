
export type TroubleshootInput = {
  brand: string;
  model: string;
  issueCategory: string;
  issueDescription: string;
};

export type TroubleshootStep = {
  title: string;
  detail: string;
};

export type ScenarioSeed = {
  key: string;
  label: string;
  description?: string;
  steps: TroubleshootStep[];
};

export const DEFAULT_SCENARIOS: ScenarioSeed[] = [
  {
    key: "screen",
    label: "Cracked / blank / flickering screen",
    description: "Display or touch problems",
    steps: [
      {
        title: "Force restart your phone",
        detail:
          "Hold the power and volume-down buttons for 10–20 seconds until the device reboots. A soft freeze can look like a dead display.",
      },
      {
        title: "Check for touch response",
        detail:
          "Plug into a charger and watch for any backlight, notification LED, or vibration when you press buttons.",
      },
      {
        title: "Inspect for physical damage",
        detail:
          "Look for cracks, black spots, or liquid lines under the glass. Note these — they help us quote accurately at the store.",
      },
      {
        title: "Safe mode (Android) / DFU awareness (iPhone)",
        detail:
          "On Android, boot to Safe Mode to rule out a bad app. If the screen stays blank after a force restart, hardware service is likely needed.",
      },
    ],
  },
  {
    key: "glass",
    label: "Broken outer display glass",
    description: "Glass cracked but display may still work",
    steps: [
      {
        title: "Check if the image still looks normal",
        detail:
          "If colors and touch work under cracked glass, note that — outer glass and full display assembly are priced differently.",
      },
      {
        title: "Avoid pressing hard on cracks",
        detail:
          "Pressure can spread damage to the LCD/OLED. Use a case or screen protector temporarily if you must keep using it.",
      },
      {
        title: "Photograph the damage",
        detail:
          "A clear photo helps us confirm whether glass-only or full display replacement is needed before you visit.",
      },
    ],
  },
  {
    key: "backglass",
    label: "Cracked back glass",
    description: "Rear glass damage",
    steps: [
      {
        title: "Check wireless charging and cameras",
        detail:
          "Test wireless charge and rear cameras. Note any issues — the quote may include camera lens or wireless coil checks.",
      },
      {
        title: "Tape sharp edges carefully",
        detail:
          "Cover sharp glass with clear tape so you don’t cut yourself while carrying the phone.",
      },
      {
        title: "Avoid moisture near cracks",
        detail:
          "Gaps in back glass let dust and moisture in. Keep the phone dry until repair.",
      },
    ],
  },
  {
    key: "battery",
    label: "Battery drain / swelling / sudden shutdown",
    description: "Power and battery health issues",
    steps: [
      {
        title: "Calibrate with a full charge cycle",
        detail:
          "Charge to 100%, unplug, use until it shuts down, then charge uninterrupted to 100% again.",
      },
      {
        title: "Reduce background drain",
        detail:
          "Turn off unused Bluetooth/GPS, lower brightness, and restrict background apps for 24 hours to see if drain improves.",
      },
      {
        title: "Check battery health settings",
        detail:
          "iPhone: Settings → Battery → Battery Health. Android: Settings → Battery. If capacity is under ~80%, replacement is usually worth it.",
      },
      {
        title: "Avoid extreme heat while charging",
        detail:
          "Remove thick cases while charging and avoid using the phone on charge if it feels hot — heat accelerates battery wear.",
      },
    ],
  },
  {
    key: "charging",
    label: "Not charging / loose port",
    description: "Wired or wireless charging failures",
    steps: [
      {
        title: "Try another cable and adapter",
        detail:
          "Faulty cables are the most common cause. Test with a known-good cable and wall adapter (not a laptop USB port).",
      },
      {
        title: "Clean the charging port",
        detail:
          "Power off, then gently clear lint from the port with a wooden/plastic toothpick — never metal. Recheck fit.",
      },
      {
        title: "Test wireless charging (if supported)",
        detail:
          "If wireless works but wired does not, the port or flex cable likely needs service.",
      },
      {
        title: "Restart and check for software charge limits",
        detail:
          "Restart the phone and disable any optimized/limit charging features temporarily to rule out software caps.",
      },
    ],
  },
  {
    key: "camera",
    label: "Camera blur / not opening",
    description: "Camera app or lens problems",
    steps: [
      {
        title: "Clean the lens and case cutout",
        detail:
          "Wipe the lens with a microfiber cloth and ensure the case isn’t blocking or pressing on the camera module.",
      },
      {
        title: "Clear the camera app cache",
        detail:
          "On Android, clear Camera app cache/data. On iPhone, force-quit Camera and retry after a restart.",
      },
      {
        title: "Test all lenses and video",
        detail:
          "Switch between ultra-wide, main, and telephoto. Note which lens fails — it speeds up parts ordering.",
      },
      {
        title: "Safe Mode / update OS",
        detail:
          "Install pending OS updates. If the camera only fails in third-party apps, reinstall those apps first.",
      },
    ],
  },
  {
    key: "speaker",
    label: "Speaker / mic / call audio",
    description: "Sound and microphone issues",
    steps: [
      {
        title: "Check silent/Do Not Disturb modes",
        detail:
          "Ensure the phone isn’t on silent, and volume isn’t muted for calls vs media separately.",
      },
      {
        title: "Clean speaker grills",
        detail:
          "Blow gently or use a soft brush on earpiece and bottom speakers — dust muffles sound a lot.",
      },
      {
        title: "Test wired / Bluetooth audio",
        detail:
          "If external audio works but speakers don’t, hardware service is likely. Disconnect Bluetooth and retest.",
      },
      {
        title: "Play a known audio file",
        detail:
          "Play a downloaded track in a stock music app to rule out streaming or app-specific issues.",
      },
    ],
  },
  {
    key: "software",
    label: "Software freeze / boot loop",
    description: "OS freezes, crashes, or won’t boot",
    steps: [
      {
        title: "Restart and install updates",
        detail:
          "Restart, then install OS and app updates. Many freezes and crashes are fixed in patches.",
      },
      {
        title: "Free up storage",
        detail:
          "Keep at least 10–15% free space. Low storage causes lag, failed updates, and app crashes.",
      },
      {
        title: "Boot into Safe Mode (Android)",
        detail:
          "If the phone is stable in Safe Mode, uninstall recently added apps one by one.",
      },
      {
        title: "Backup before a reset",
        detail:
          "If problems persist, back up photos/contacts, then try a factory reset. Come to us if it still misbehaves — it may be hardware.",
      },
    ],
  },
  {
    key: "water",
    label: "Water / liquid damage",
    description: "Spills or immersion damage",
    steps: [
      {
        title: "Power off immediately",
        detail:
          "Do not charge or turn the phone on if it got wet. Power off to limit short-circuit damage.",
      },
      {
        title: "Dry externally — skip rice",
        detail:
          "Wipe with a dry cloth. Avoid rice/heat/hairdryers. Rice dust can worsen port damage.",
      },
      {
        title: "Do not use or charge yet",
        detail:
          "Wait and bring it in for ultrasonic cleaning ASAP. Delays often turn a recoverable spill into permanent failure.",
      },
      {
        title: "Note the liquid type and time",
        detail:
          "Tell us if it was water, coffee, or seawater and roughly when it happened — that changes the repair plan.",
      },
    ],
  },
  {
    key: "other",
    label: "Other issue",
    description: "Anything not covered above",
    steps: [
      {
        title: "Force restart",
        detail:
          "Hold power + volume for 10–20 seconds. Many odd glitches clear after a hard reboot.",
      },
      {
        title: "Note exact symptoms",
        detail:
          "Write when it happens (charging, calls, heat, after drop). Clear notes help us diagnose faster in-store.",
      },
      {
        title: "Check for pending updates",
        detail:
          "Install system updates if the phone is usable — then retest the issue before visiting.",
      },
      {
        title: "Backup important data",
        detail:
          "Back up photos and contacts before any repair visit so your data stays safe either way.",
      },
    ],
  },
];

/** Fallback list for static imports; prefer listScenarios() on the server */
export const ISSUE_CATEGORIES = DEFAULT_SCENARIOS.map((s) => ({
  value: s.key,
  label: s.label,
}));

export const PHONE_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Xiaomi",
  "Vivo",
  "Oppo",
  "Realme",
  "Motorola",
  "Nothing",
  "iQOO",
  "Poco",
  "Nokia",
  "Honor",
  "Asus",
  "Huawei",
  "Other",
] as const;

export const STORAGE_OPTIONS = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
] as const;

export const CONDITIONS = [
  { value: "excellent", label: "Excellent — like new" },
  { value: "good", label: "Good — light wear" },
  { value: "fair", label: "Fair — visible scratches / minor issues" },
  { value: "poor", label: "Poor — cracks or heavy wear" },
] as const;
