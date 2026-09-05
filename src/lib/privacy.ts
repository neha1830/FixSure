export const WIPE_CHECKLIST = [
  {
    title: "Back up what you need",
    detail:
      "Copy important photos, chats, contacts, and documents to the cloud or a computer — just in case.",
  },
  {
    title: "Remove SIM and memory card",
    detail:
      "Take your SIM (and microSD if any) with you. We only need the device for repair.",
  },
  {
    title: "Note your passcode if you’re comfortable",
    detail:
      "Some repairs need the screen unlocked to test. Share the passcode only if you choose to — never required for gallery access.",
  },
  {
    title: "Optional photo consent",
    detail:
      "We never open your gallery for curiosity. Before/after repair photos are only published if you give written consent.",
  },
] as const;

export const PRIVACY_PLEDGES = [
  "We never browse your photos, messages, or apps without your explicit permission.",
  "Repair work focuses on the reported fault — not your personal content.",
  "Before/after photos for our gallery are only used when you consent in writing.",
  "You do not need to sign out of accounts or factory-reset your phone to get service.",
  "Staff access is limited to technicians assigned to your job.",
] as const;
