import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import path from "path";
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
]);
//# sourceMappingURL=eslint.config.js.map