import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "path";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: path.resolve(__dirname, "./tsconfig.json"),
        tsconfigRootDir: path.resolve(__dirname, ".."),
      },
      globals: globals.node,
    },
    plugins: {
      js,
      "@typescript-eslint": tseslint.plugin,
    },
    extends: ["js/recommended", ...tseslint.configs.recommended],
  },
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
