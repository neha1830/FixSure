/** Unique atmospheric stage colors + leaf overlay for each product card. */

const STAGE_PALETTES = [
  { from: "#fce7f3", to: "#fbcfe8", accent: "#f9a8d4" }, // soft pink
  { from: "#e0e7ff", to: "#c7d2fe", accent: "#a5b4fc" }, // indigo
  { from: "#ccfbf1", to: "#99f6e4", accent: "#5eead4" }, // mint
  { from: "#fef3c7", to: "#fde68a", accent: "#fcd34d" }, // warm amber
  { from: "#ede9fe", to: "#ddd6fe", accent: "#c4b5fd" }, // lavender
  { from: "#e0f2fe", to: "#bae6fd", accent: "#7dd3fc" }, // sky
  { from: "#ffedd5", to: "#fed7aa", accent: "#fdba74" }, // peach
  { from: "#ecfccb", to: "#d9f99d", accent: "#bef264" }, // lime
  { from: "#fce7f0", to: "#f5d0e8", accent: "#e9a8d4" }, // rose
  { from: "#e2e8f0", to: "#cbd5e1", accent: "#94a3b8" }, // slate
  { from: "#fef9c3", to: "#fef08a", accent: "#fde047" }, // lemon
  { from: "#cffafe", to: "#a5f3fc", accent: "#67e8f9" }, // cyan
  { from: "#fae8ff", to: "#f5d0fe", accent: "#e879f9" }, // fuchsia
  { from: "#d1fae5", to: "#a7f3d0", accent: "#6ee7b7" }, // emerald
  { from: "#ffe4e6", to: "#fecdd3", accent: "#fda4af" }, // blush
  { from: "#eef2ff", to: "#e0e7ff", accent: "#c7d2fe" }, // periwinkle
  { from: "#faf5ff", to: "#f3e8ff", accent: "#e9d5ff" }, // soft violet
  { from: "#ecfeff", to: "#cffafe", accent: "#a5f3fc" }, // ice
  { from: "#fff7ed", to: "#ffedd5", accent: "#fdba74" }, // apricot
  { from: "#f0fdf4", to: "#dcfce7", accent: "#86efac" }, // spring
] as const;

const LEAF_OVERLAYS = [
  "/images/leaf-shadow-a.svg",
  "/images/leaf-shadow-b.svg",
  "/images/leaf-shadow-c.svg",
] as const;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function productStage(id: string): {
  from: string;
  to: string;
  accent: string;
  leaf: string;
  tilt: number;
} {
  const h = hashId(id);
  const palette = STAGE_PALETTES[h % STAGE_PALETTES.length];
  const leaf = LEAF_OVERLAYS[h % LEAF_OVERLAYS.length];
  // slight unique 3D tilt between -8 and 8 degrees
  const tilt = ((h % 17) - 8) * 0.65;
  return { ...palette, leaf, tilt };
}
