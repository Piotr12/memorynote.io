// WCAG 2.2 contrast math, relative luminance and contrast ratio.
// Used to verify that the token pairs stay at AA in both themes.

function hexToChannel(hex: string, offset: number): number {
  // The caller validates the full string first, so every slice here is a
  // valid hex pair.
  return parseInt(hex.slice(offset, offset + 2), 16);
}

function channelLuminance(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`not a hex color: ${hex}`);
  }
  return (
    0.2126 * channelLuminance(hexToChannel(hex, 1)) +
    0.7152 * channelLuminance(hexToChannel(hex, 3)) +
    0.0722 * channelLuminance(hexToChannel(hex, 5))
  );
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.2 AA minimums: 4.5 for normal text, 3.0 for large text and UI
// component boundaries.
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3.0;
