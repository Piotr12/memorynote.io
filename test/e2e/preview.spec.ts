import { expect, test } from "@playwright/test";

// Viewport matrix, one set for content assertions and screenshots:
// mobile, the 640 px edge, tablet (sidebar appears), desktop.
const mobile = { width: 390, height: 900 };
const edge = { width: 640, height: 900 };
const tablet = { width: 768, height: 900 };
const desktop = { width: 1440, height: 900 };
const widths = [mobile, edge, tablet, desktop];

const branch = process.env.NEXT_PUBLIC_BUILD_BRANCH;
const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT;

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
});

test("redirects the root to /design-preview", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/design-preview/**");
  await expect(page.locator("section#color")).toBeVisible();
});

test.describe("theme", () => {
  test("toggling persists across a reload", async ({ page }) => {
    await page.goto("/design-preview");
    const initial = await page.locator("html").getAttribute("data-theme");
    await page.locator("button.mode").click();
    const flipped = await page.locator("html").getAttribute("data-theme");
    expect(flipped).not.toBe(initial);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", flipped!);
    const stored = await page
      .locator("html")
      .evaluate(() => window.localStorage.getItem("memorynote-theme"));
    expect(stored).toBe(flipped);
  });

  test("follows the system when nothing is stored", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/design-preview");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/design-preview");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("shows no flash of the wrong mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    // The attribute must be set before the first navigation event completes.
    await page.goto("/design-preview", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("toggles by keyboard with a visible focus state", async ({
    page,
  }) => {
    await page.goto("/design-preview");
    const initial = await page.locator("html").getAttribute("data-theme");
    await page.locator("button.mode").focus();
    const visible = await page
      .locator("button.mode")
      .evaluate((el) => el.matches(":focus-visible"));
    expect(visible).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      initial === "dark" ? "light" : "dark",
    );
  });
});

test.describe("footer", () => {
  test("shows the branch and commit from the build", async ({ page }) => {
    expect(branch, "the e2e build must set NEXT_PUBLIC_BUILD_BRANCH").toBeTruthy();
    expect(commit, "the e2e build must set NEXT_PUBLIC_BUILD_COMMIT").toBeTruthy();
    await page.goto("/design-preview");
    const footer = page.locator("footer");
    await expect(footer).toContainText("built on dgxspark in Jozefoslaw.");
    await expect(footer).toContainText(
      `branch: ${branch} · commit: ${commit}`,
    );
  });
});

test.describe("font", () => {
  test("makes no request to a font host", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "127.0.0.1" && host !== "localhost") {
        external.push(request.url());
      }
    });
    await page.goto("/design-preview");
    expect(external).toEqual([]);
    const families = await page
      .locator("body")
      .evaluate(() => document.fonts.ready.then(() => "loaded"));
    expect(families).toBe("loaded");
  });
});

test.describe("layout", () => {
  test("makes the aside nav sticky at desktop width only", async ({
    page,
  }) => {
    await page.setViewportSize(desktop);
    await page.goto("/design-preview");
    const sticky = await page.locator("aside").evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(sticky).toBe("sticky");

    await page.setViewportSize(mobile);
    await page.reload();
    const notSticky = await page.locator("aside").evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(notSticky).not.toBe("sticky");
  });
});

test.describe("content", () => {
  for (const size of widths) {
    test(`shows every section and its content at ${size.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto("/design-preview");

      // palette: each token name with its light and dark value
      const color = page.locator("section#color");
      await expect(color).toBeVisible();
      for (const name of [
        "--orange",
        "--accent",
        "--bg",
        "--surface",
        "--text-2",
      ]) {
        const token = color.getByText(name, { exact: true });
        expect(await token.count(), `${name} shown`).toBeGreaterThan(0);
      }
      for (const hex of [
        "#f97316",
        "#c2410c",
        "#fb923c",
        "#fcfcfb",
        "#0c0a09",
        "#ffffff",
        "#1c1917",
        "#57534e",
        "#a8a29e",
      ]) {
        const value = color.locator(`text=${hex.toUpperCase()}`);
        expect(await value.count(), `${hex} shown`).toBeGreaterThan(0);
      }

      // type scale: the display specimen and every role
      const type = page.locator("section#type");
      await expect(type).toBeVisible();
      await expect(type.locator(".big")).toHaveText("A note, kept.");
      await expect(type.getByText("44 / 700")).toBeVisible();
      for (const meta of ["24 / 600 / 1.3", "16 / 400 / 1.6", "14 / 400 / 1.6", "13 / 500 / 1.4"]) {
        await expect(type.getByText(meta, { exact: true })).toBeVisible();
      }

      // spacing and radius
      const space = page.locator("section#space");
      await expect(space).toBeVisible();
      for (const step of [4, 8, 12, 16, 24, 32, 48, 64]) {
        await expect(
          space
            .locator(".space-row .meta")
            .filter({ hasText: new RegExp(`^${step}$`) }),
        ).toBeVisible();
      }
      await expect(space.getByText("8 px", { exact: false })).toBeVisible();
      await expect(space.getByText("12 px", { exact: false })).toBeVisible();

      // breakpoints
      const bps = page.locator("section#breakpoints");
      await expect(bps).toBeVisible();
      for (const px of [640, 768, 1024, 1280]) {
        await expect(bps.getByText(String(px), { exact: true })).toBeVisible();
      }

      // components
      const components = page.locator("section#components");
      await expect(components).toBeVisible();
      await expect(components.locator("button.btn")).toHaveCount(3);
      await expect(components.locator("input[type=text]")).toBeVisible();
      await expect(components.locator(".card")).toBeVisible();
      await expect(components.locator(".s-c")).toBeVisible();
    });
  }
});
