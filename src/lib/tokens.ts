// The token values as machine data, so the /design-preview page and the
// unit tests read one source. Display copy lives in src/i18n/messages.ts.
// The CSS custom properties in globals.css are the single token source
// for styling; this module must stay in sync with it, which tokens.test.ts
// enforces.

import { messages } from "../i18n/messages";
import { contrastRatio } from "./contrast";

export type TokenNote = "brand" | "ratioOnBg" | "textOnBg" | "surface";

export interface ColorToken {
  name: string;
  light: string;
  dark: string;
  /** Which contrast note the page shows for this token, if any. */
  note?: TokenNote;
}

// Every color token in globals.css, both themes. The cross-check in
// tokens.test.ts runs against this full list.
export const colorTokens: ColorToken[] = [
  { name: "--orange", light: "#F97316", dark: "#F97316", note: "brand" },
  { name: "--accent", light: "#C2410C", dark: "#FB923C", note: "ratioOnBg" },
  { name: "--accent-hover", light: "#9A3412", dark: "#FDBA74" },
  { name: "--on-accent", light: "#FFFFFF", dark: "#1C1917" },
  { name: "--accent-soft", light: "#FFF7ED", dark: "#431407" },
  { name: "--focus", light: "#EA580C", dark: "#FB923C" },
  { name: "--bg", light: "#FCFCFB", dark: "#0C0A09", note: "textOnBg" },
  { name: "--surface", light: "#FFFFFF", dark: "#1C1917", note: "surface" },
  { name: "--surface-2", light: "#F5F5F4", dark: "#292524" },
  { name: "--text", light: "#1C1917", dark: "#FAFAF9" },
  { name: "--text-2", light: "#57534E", dark: "#A8A29E", note: "ratioOnBg" },
  { name: "--border", light: "#E7E5E4", dark: "#44403C" },
  { name: "--border-2", light: "#D6D3D1", dark: "#57534E" },
];

export function colorToken(name: string): ColorToken {
  const token = colorTokens.find((t) => t.name === name);
  if (token === undefined) {
    throw new Error(`unknown color token: ${name}`);
  }
  return token;
}

// The color section renders the palette in the mockup's shape:
// eight chips and five rows of the contrast table.
export const paletteChips = [
  "--orange",
  "--accent",
  "--accent-soft",
  "--bg",
  "--surface",
  "--text",
  "--text-2",
  "--border",
];

export const contrastTable = [
  "--orange",
  "--accent",
  "--bg",
  "--surface",
  "--text-2",
];

// The contrast note of a table row. The phrases live in the i18n
// catalog; the ratios are computed from the token values on --bg.
export function colorNote(token: ColorToken): string {
  const note = token.note;
  if (note === undefined) {
    return "";
  }
  const phrase = messages.tokenNotes[note];
  if (note === "ratioOnBg") {
    const bg = colorToken("--bg");
    return phrase
      .replace(
        "{light}",
        formatRatio(contrastRatio(token.light, bg.light)),
      )
      .replace(
        "{dark}",
        formatRatio(contrastRatio(token.dark, bg.dark)),
      );
  }
  if (note === "textOnBg") {
    const bg = colorToken("--bg");
    const text = colorToken("--text");
    return phrase.replace(
      "{light}",
      formatRatio(contrastRatio(text.light, bg.light)),
    );
  }
  return phrase;
}

export interface TypeRole {
  role: "heading" | "body" | "small" | "caption";
  meta: string;
  className: string;
}

export const typeScale: TypeRole[] = [
  { role: "heading", meta: "24 / 600 / 1.3", className: "s-h" },
  { role: "body", meta: "16 / 400 / 1.6", className: "s-b" },
  { role: "small", meta: "14 / 400 / 1.6", className: "s-s" },
  { role: "caption", meta: "13 / 500 / 1.4", className: "s-c" },
];

export const displaySpecimen = {
  meta: "44 / 700",
  className: "big",
};

export const spacingSteps = [4, 8, 12, 16, 24, 32, 48, 64];

export const radiusControls = 8;
export const radiusCards = 12;

export interface Breakpoint {
  px: number;
  id: "sm" | "md" | "lg" | "xl";
}

export const breakpoints: Breakpoint[] = [
  { px: 640, id: "sm" },
  { px: 768, id: "md" },
  { px: 1024, id: "lg" },
  { px: 1280, id: "xl" },
];

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)} : 1`;
}
