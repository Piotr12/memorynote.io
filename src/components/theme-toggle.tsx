"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import { STORAGE_KEY } from "@/lib/theme";
import { messages } from "@/i18n/messages";

// The inline head script sets data-theme before first paint, so the
// client initializer already reads the current mode. The server pass
// has no document and renders the default label.
function initialTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is unavailable (private mode); the choice applies to this
      // session only. The attribute is already set.
    }
    setTheme(next);
  }

  const label = theme === "dark" ? messages.toggleToLight : messages.toggleToDark;

  return (
    <button className="mode" type="button" onClick={toggle}>
      {label}
    </button>
  );
}
