// Mutation tests for the key logic: theme resolution, the footer line, and
// the WCAG contrast math. Every surviving mutant must be killed or
// explained in the PR.
export default {
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
    // Related mode could not map the mutated files to their tests here,
    // so every mutant runs the full unit suite instead.
    related: false,
  },
  // Only the key logic files are mutated; everything else stays as is.
  mutate: [
    "src/lib/theme.ts",
    "src/lib/build-info.ts",
    "src/lib/contrast.ts",
  ],
  ignorePatterns: ["out", "test-results", "test/evidence"],
  reporters: ["clear-text"],
  // One mutant survives by necessity: the sRGB 0.03928 threshold is
  // unreachable with 8-bit channels (see contrast.test.ts). 98 allows
  // exactly that one of 87; any further survivor fails the run.
  thresholds: {
    high: 98,
  },
};
