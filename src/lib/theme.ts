// Theme resolution: the persisted choice wins, the system preference is
// the fallback. Shared by the inline head script (via its string contract)
// and the ThemeToggle component.

export type Theme = "light" | "dark";

export const STORAGE_KEY = "memorynote-theme";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(
  persisted: string | null,
  systemPrefersDark: boolean,
): Theme {
  if (isTheme(persisted)) {
    return persisted;
  }
  return systemPrefersDark ? "dark" : "light";
}
