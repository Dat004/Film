import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,

  // TypeScript + import rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
    },
    rules: {
      // Warn on `any` (full elimination deferred per plan decision)
      "@typescript-eslint/no-explicit-any": "warn",
      // Enforce type-only imports for better tree shaking
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      // Direct console usage should go through @/lib/logger
      "no-console": "error",
      // Import ordering
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-cycle": "warn",
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@radix-ui/*"],
              message: "Import Radix primitives only from @/components/ui — not directly from @radix-ui/*.",
            },
          ],
        },
      ],

      // Keep React Compiler diagnostics visible without blocking the current CI baseline.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },

  // Allow Radix imports inside the UI primitive layer only
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  // Console output is intentional at the logging and environment boundaries.
  {
    files: ["src/lib/logger.ts", "src/lib/env.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // Default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "e2e/**",
    "playwright.config.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
