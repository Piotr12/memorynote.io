import { describe, expect, it } from "vitest";
import {
  AA_LARGE,
  AA_NORMAL,
  contrastRatio,
  relativeLuminance,
} from "./contrast";
import { colorToken } from "./tokens";

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
  // The values come from the token table, so a drifted token fails here.
  // --orange is decorative in light mode by the spec's own decision; it is
  // checked there only as large text on dark, where it passes.
  it("keeps AA for text pairings in light mode", () => {
    const accent = colorToken("--accent");
    const bg = colorToken("--bg");
    const onAccent = colorToken("--on-accent");
    const text = colorToken("--text");
    const text2 = colorToken("--text-2");
    expect(contrastRatio(accent.light, bg.light)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(text.light, bg.light)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(text2.light, bg.light)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(onAccent.light, accent.light)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("keeps AA for text pairings in dark mode", () => {
    const accent = colorToken("--accent");
    const bg = colorToken("--bg");
    const onAccent = colorToken("--on-accent");
    const text = colorToken("--text");
    const text2 = colorToken("--text-2");
    expect(contrastRatio(accent.dark, bg.dark)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(text.dark, bg.dark)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(text2.dark, bg.dark)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(onAccent.dark, accent.dark)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("keeps the large-text minimum for the decorative orange on dark", () => {
    expect(
      contrastRatio(colorToken("--orange").dark, colorToken("--bg").dark),
    ).toBeGreaterThanOrEqual(AA_LARGE);
  });

  // WCAG 1.4.11: non-text contrast of component boundaries, 3:1 in both
  // modes. The input and the secondary button carry the border.
  it("keeps the non-text minimum for the component borders on surface", () => {
    const border = colorToken("--border-strong");
    const surface = colorToken("--surface");
    expect(contrastRatio(border.light, surface.light)).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
    expect(contrastRatio(border.dark, surface.dark)).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
  });
});
