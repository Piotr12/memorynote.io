import { describe, expect, it } from "vitest";
import { isTheme, resolveTheme, STORAGE_KEY } from "./theme";
import { themeInitScript } from "./theme-script";

describe("STORAGE_KEY", () => {
  it("is the literal key the inline head script reads", () => {
    // Pinned against the literal, not against itself: the head script
    // carries the string, so a drift in either side shows up here.
    expect(STORAGE_KEY).toBe("memorynote-theme");
    expect(themeInitScript).toContain("memorynote-theme");
  });
});

describe("resolveTheme", () => {
  it("returns the persisted choice when it is a valid theme", () => {
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("dark", true)).toBe("dark");
  });

  it("falls back to the system preference when nothing is persisted", () => {
    expect(resolveTheme(null, false)).toBe("light");
    expect(resolveTheme(null, true)).toBe("dark");
  });

  it("ignores an invalid persisted value and uses the system preference", () => {
    expect(resolveTheme("blue", false)).toBe("light");
    expect(resolveTheme("blue", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
    expect(resolveTheme("", true)).toBe("dark");
  });
});

describe("isTheme", () => {
  it("accepts only the exact theme names", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("Light")).toBe(false);
    expect(isTheme("")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
