// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Keep Next.js defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Paths ESLint shouldn't scan
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Project-wide rule tweaks (turn hard errors into warnings or off)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Allow `any` while you're iterating quickly
      "@typescript-eslint/no-explicit-any": "off",

      // Don't block the build on ts-ignore comments for now
      "@typescript-eslint/ban-ts-comment": "off",

      // Only warn on unused vars; ignore variables/args that start with "_"
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Just warn about <img>, you can revisit later to switch to next/image
      "@next/next/no-img-element": "warn",
    },
  },
];
