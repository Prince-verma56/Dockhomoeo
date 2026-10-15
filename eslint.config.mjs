import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not part of this Next.js app: the read-only reference clone (also
    // excluded in tsconfig.json and .gitignore) and the Express backend, a
    // separate package with its own tooling.
    "docohomo-prince/**",
    "backend/**",
  ]),
]);

export default eslintConfig;
