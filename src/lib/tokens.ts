// The token values as data, so the /design-preview page and the unit tests
// read one source. The CSS custom properties in globals.css are the single
// token source for styling; this module must stay in sync with it, which
// tokens.test.ts enforces.

import { contrastRatio } from "./contrast";

export interface ColorToken {
  name: string;
  light: string;
  dark: string;
  note: string;
}

export const colorTokens: ColorToken[] = [
  {
    name: "--orange",
    light: "#F97316",
    dark: "#F97316",
    note: "brand, large use only",
  },
  {
    name: "--accent",
    light: "#C2410C",
    dark: "#FB923C",
    note: `ratio: ${formatRatio(contrastRatio("#C2410C", "#FCFCFB"))} · ${formatRatio(
      contrastRatio("#FB923C", "#0C0A09"),
    )}`,
  },
  {
    name: "--bg",
    light: "#FCFCFB",
    dark: "#0C0A09",
    note: `text on bg ${formatRatio(contrastRatio("#1C1917", "#FCFCFB"))}`,
  },
  {
    name: "--surface",
    light: "#FFFFFF",
    dark: "#1C1917",
    note: "cards, inputs",
  },
  {
    name: "--text-2",
    light: "#57534E",
    dark: "#A8A29E",
    note: `ratio: ${formatRatio(contrastRatio("#57534E", "#FCFCFB"))} · ${formatRatio(
      contrastRatio("#A8A29E", "#0C0A09"),
    )}`,
  },
];

export interface TypeRole {
  role: string;
  meta: string;
  className: string;
  sample: string;
}

export const typeScale: TypeRole[] = [
  {
    role: "heading",
    meta: "24 / 600 / 1.3",
    className: "s-h",
    sample: "Spring plan, first draft",
  },
  {
    role: "body",
    meta: "16 / 400 / 1.6",
    className: "s-b",
    sample: "Write it down before it walks away.",
  },
  {
    role: "small",
    meta: "14 / 400 / 1.6",
    className: "s-s",
    sample: "Faster than Tuesday. The river route held up.",
  },
  {
    role: "caption",
    meta: "13 / 500 / 1.4",
    className: "s-c",
    sample: "edited 12 min ago",
  },
];

export const displaySpecimen = {
  meta: "44 / 700",
  className: "big",
  sample: "A note, kept.",
};

export const spacingSteps = [4, 8, 12, 16, 24, 32, 48, 64];

export const radiusControls = 8;
export const radiusCards = 12;

export interface Breakpoint {
  px: number;
  use: string;
}

export const breakpoints: Breakpoint[] = [
  { px: 640, use: "small phones up" },
  { px: 768, use: "tablets up — sidebar layout appears" },
  { px: 1024, use: "laptops up" },
  { px: 1280, use: "desktop up, content max width" },
];

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)} : 1`;
}
