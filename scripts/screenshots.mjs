// Captures the full /design-preview page in both modes at the mockup
// viewports. The output directory is the evidence folder; CI copies it
// into the PR evidence.

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve(process.argv[2] ?? "test/evidence");
const host = process.env.PW_HOST ?? "http://127.0.0.1:4173";

const viewports = [
  { name: "desktop", width: 1440 },
  { name: "mobile", width: 390 },
];
const modes = ["light", "dark"];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
for (const mode of modes) {
  const context = await browser.newContext({ colorScheme: mode });
  const page = await context.newPage();
  await page.goto(`${host}/design-preview`, { waitUntil: "networkidle" });
  // The inline script sets data-theme before paint; wait until it matches
  // the requested mode so the screenshot is deterministic.
  // eslint-disable-next-line no-undef
  await page.waitForFunction((want) => document.documentElement.getAttribute("data-theme") === want, mode);
  // Browser-side font wait: the identifiers exist in the page, not in node.
  // eslint-disable-next-line no-undef
  await page.evaluate(() => new Promise((done) => document.fonts.ready.then(() => requestAnimationFrame(done))));
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: 900 });
    await page.waitForTimeout(150);
    const file = `design-preview-${mode}-${vp.name}.png`;
    await page.screenshot({ path: resolve(outDir, file), fullPage: true });
    console.log(file);
  }
  await context.close();
}
await browser.close();
