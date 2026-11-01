// The inline script that sets data-theme on <html> before first paint.
// It must run before the stylesheet is applied, so the page never shows
// the wrong mode. It is plain JavaScript, not a module: it is inlined into
// <head> at build time and has no import statements.
//
// Contract (checked by theme-script.test.ts):
// - reads localStorage before it reads the system preference,
// - accepts only the exact values "light" and "dark" from storage,
// - falls back to matchMedia("(prefers-color-scheme: dark)") when the
//   stored value is absent or invalid,
// - sets the data-theme attribute on document.documentElement.
export const themeInitScript = `(function () {
  var theme = null;
  try {
    var stored = window.localStorage.getItem("memorynote-theme");
    if (stored === "light" || stored === "dark") {
      theme = stored;
    }
  } catch (error) {
    theme = null;
  }
  if (theme === null) {
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = dark ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();`;
