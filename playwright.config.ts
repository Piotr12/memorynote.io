import { defineConfig } from "@playwright/test";

// npm run e2e builds the static export with the local build identity,
// then this config serves out/ with scripts/serve.mjs. The footer test
// reads the same identity from the environment.
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
    // A server already on the port makes the run fail, so a stale
    // build can never be tested silently.
    timeout: 30_000,
  },
});
