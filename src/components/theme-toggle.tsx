"use client";

import { useSyncExternalStore } from "react";
import type { Theme } from "@/lib/theme";
import { STORAGE_KEY } from "@/lib/theme";
import { messages } from "@/i18n/messages";

// The data-theme attribute on <html> is the single source of truth: the
// inline head script sets it before first paint and the toggle updates it.
// The component mirrors it through an external store instead of holding a
// copy in state, so the label can never drift from the applied mode.

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

// The static export renders before the user's preference is known, so the
// server pass and the hydration pass agree on the default. The client pass
// re-renders with the attribute value the head script already applied.
function serverTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is unavailable (private mode); the choice applies to this
      // session only. The attribute is already set.
    }
  }

  const label = theme === "dark" ? messages.toggleToLight : messages.toggleToDark;

  return (
    <button className="mode" type="button" onClick={toggle}>
      {label}
    </button>
  );
}
