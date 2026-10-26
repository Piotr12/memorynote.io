import { describe, expect, it } from "vitest";
import {
  AA_LARGE,
  AA_NORMAL,
  contrastRatio,
  relativeLuminance,
} from "./contrast";

describe("relativeLuminance", () => {
  it("is 1 for white and 0 for black", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  // Channel 10 and 11 straddle the sRGB linear/gamma threshold:
  // 10/255 < 0.03928 <= 11/255. These pin both branches on either side of
  // the threshold. The exact 0.03928 boundary is unreachable with 8-bit
  // channels, so the <= to < mutant on it survives by necessity.
  it("applies the linear branch below and the gamma branch above the sRGB threshold", () => {
    const linear = 10 / 255 / 12.92;
    const srgb11 = 11 / 255;
    const gamma = Math.pow((srgb11 + 0.055) / 1.055, 2.4);
    // A pure-channel color isolates that channel's luminance weight.
    expect(relativeLuminance("#0a0000")).toBeCloseTo(0.2126 * linear, 6);
    expect(relativeLuminance("#000b00")).toBeCloseTo(0.7152 * gamma, 6);
    expect(relativeLuminance("#00000b")).toBeCloseTo(0.0722 * gamma, 6);
  });

  it("rejects non-hex colors and says which", () => {
    expect(() => relativeLuminance("white")).toThrow(
      /not a hex color: white/,
    );
    expect(() => relativeLuminance("#fff")).toThrow();
    expect(() => relativeLuminance("#12345G")).toThrow();
    // A trailing extra digit is rejected by the end anchor.
    expect(() => relativeLuminance("#1234567")).toThrow();
    // A prefix before the hash is rejected by the start anchor.
    expect(() => relativeLuminance("xx#123456")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("is 21 for white on black, in both orders", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is 1 for a color against itself", () => {
    expect(contrastRatio("#c2410c", "#c2410c")).toBeCloseTo(1, 5);
  });

  // The spec-named pairings from the signed spec's edge cases, both themes.
  // --orange is decorative in light mode by the spec's own decision; it is
  // checked there only as large text on dark, where it passes.
  it("keeps AA for text pairings in light mode", () => {
    expect(contrastRatio("#c2410c", "#fcfcfb")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#1c1917", "#fcfcfb")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#57534e", "#fcfcfb")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#ffffff", "#c2410c")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("keeps AA for text pairings in dark mode", () => {
    expect(contrastRatio("#fb923c", "#0c0a09")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#fafafa", "#0c0a09")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#a8a29e", "#0c0a09")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio("#1c1917", "#fb923c")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("keeps the large-text minimum for the decorative orange on dark", () => {
    expect(contrastRatio("#f97316", "#0c0a09")).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
  });
});
