import { describe, expect, it } from "vitest";
import { themeInitScript } from "./theme-script";
import { STORAGE_KEY } from "./theme";

// The inline script is a string contract: it runs before first paint, so a
// regression in its order or its accepted values shows up here, not in a
// browser.
describe("themeInitScript", () => {
  it("reads localStorage before the system preference", () => {
    const storageAt = themeInitScript.indexOf("localStorage.getItem");
    const mediaAt = themeInitScript.indexOf("matchMedia");
    expect(storageAt).toBeGreaterThan(-1);
    expect(mediaAt).toBeGreaterThan(storageAt);
  });

  it("uses the storage key shared with the toggle", () => {
    expect(themeInitScript).toContain(STORAGE_KEY);
  });

  it("accepts only the exact values light and dark from storage", () => {
    expect(themeInitScript).toContain('stored === "light"');
    expect(themeInitScript).toContain('stored === "dark"');
  });

  it("sets data-theme on document.documentElement", () => {
    expect(themeInitScript).toContain(
      'document.documentElement.setAttribute("data-theme", theme)',
    );
  });

  it("checks the system dark preference", () => {
    expect(themeInitScript).toContain('(prefers-color-scheme: dark)');
  });
});
