import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/", "out/", "node_modules/", "coverage/", "evidence/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // User-facing text lives in the catalog module, not in components.
      "no-console": "error",
    },
  },
  {
    // The scripts are node CLI tools; console output is their purpose.
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-console": "off",
    },
  },
);
