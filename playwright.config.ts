import { defineConfig } from "@playwright/test";

// The e2e run builds the static export with footer values set, then serves
// out/ with scripts/serve.mjs. See the e2e script in package.json.
const port = 4173;

export default defineConfig({
  testDir: "test/e2e",
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
  },
  webServer: {
    command: `node scripts/serve.mjs out ${port}`,
    url: `http://127.0.0.1:${port}/up`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
