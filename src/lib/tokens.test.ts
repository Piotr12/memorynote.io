import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  breakpoints,
  colorTokens,
  displaySpecimen,
  radiusCards,
  radiusControls,
  spacingSteps,
  typeScale,
} from "./tokens";

const here = fileURLToPath(import.meta.url);
const appDir = join(here, "..", "..", "app");
const css = readFileSync(join(appDir, "globals.css"), "utf8");

// The CSS custom properties are the single token source. This test keeps
// the page data in tokens.ts in sync with them and guards the media
// queries against values that are not tokens.

function declarations(block: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    found[`--${match[1]}`] = match[2].trim().toLowerCase();
  }
  return found;
}

function lightTokens(): Record<string, string> {
  const start = css.indexOf(":root {");
  const end = css.indexOf("}", start);
  return declarations(css.slice(start, end));
}

function darkTokens(): Record<string, string> {
  const start = css.indexOf(':root[data-theme="dark"] {');
  const end = css.indexOf("}", start);
  return declarations(css.slice(start, end));
}

const mediaQueries = [...css.matchAll(/@media\s*\((min-width|max-width):\s*(\d+)px\)/g)];

describe("single token source", () => {
  it("declares every color token in light and dark", () => {
    const light = lightTokens();
    const dark = darkTokens();
    for (const token of colorTokens) {
      expect(light[token.name], `${token.name} light`).toBe(
        token.light.toLowerCase(),
      );
      expect(dark[token.name], `${token.name} dark`).toBe(
        token.dark.toLowerCase(),
      );
    }
  });

  it("declares the spacing steps as tokens", () => {
    const light = lightTokens();
    for (const step of spacingSteps) {
      expect(light[`--space-${step / 4}`], `--space-${step / 4}`).toBe(
        `${step}px`,
      );
    }
  });

  it("declares both radii as tokens", () => {
    const light = lightTokens();
    expect(light["--radius-control"]).toBe(`${radiusControls}px`);
    expect(light["--radius-card"]).toBe(`${radiusCards}px`);
  });

  it("declares every breakpoint as a token", () => {
    const light = lightTokens();
    expect(light["--bp-sm"]).toBe("640px");
    expect(light["--bp-md"]).toBe("768px");
    expect(light["--bp-lg"]).toBe("1024px");
    expect(light["--bp-xl"]).toBe("1280px");
    for (const bp of breakpoints) {
      expect(breakpoints.map((b) => b.px)).toContain(bp.px);
    }
  });

  it("uses only min-width media queries, with token values", () => {
    const values = new Set(breakpoints.map((bp) => bp.px));
    expect(mediaQueries.length).toBeGreaterThan(0);
    for (const [, kind, px] of mediaQueries) {
      expect(kind, `only min-width queries, found ${kind}: ${px}px`).toBe(
        "min-width",
      );
      expect(values.has(Number(px)), `${px}px is a breakpoint token`).toBe(
        true,
      );
    }
  });

  it("declares a CSS class for every type role and the display specimen", () => {
    const roles = new Set(typeScale.map((r) => r.className));
    expect(roles.size).toBe(typeScale.length);
    for (const role of typeScale) {
      expect(css, `.${role.className}`).toContain(`.${role.className} {`);
    }
    expect(css, `.${displaySpecimen.className}`).toContain(
      `.${displaySpecimen.className} {`,
    );
  });

  it("declares the self-hosted font without a runtime swap", () => {
    const face = css.slice(
      css.indexOf("@font-face {"),
      css.indexOf("}", css.indexOf("@font-face {")),
    );
    expect(face).toContain('font-family: "Inter"');
    expect(face).toContain("font-display: block");
    expect(face).not.toContain("font-display: swap");
    expect(face).toContain('url("/fonts/inter-variable.woff2")');
  });
});

describe("component files hold no raw color values", () => {
  const componentsDir = join(appDir, "..", "components");
  const tsxFiles = readdirSync(componentsDir).filter((n) =>
    n.endsWith(".tsx"),
  );
  const appTsx = readdirSync(appDir).filter((n) => n.endsWith(".tsx"));

  it("finds component files to check", () => {
    expect(tsxFiles.length).toBeGreaterThanOrEqual(6);
    expect(appTsx.length).toBeGreaterThanOrEqual(1);
  });

  it("uses no raw hex color in component or page code", () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/g;
    const files = [
      ...tsxFiles.map((n) => join(componentsDir, n)),
      ...appTsx.map((n) => join(appDir, n)),
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const matches = source.match(hex);
      expect(matches, `${file} holds raw hex colors`).toBeNull();
    }
  });
});
