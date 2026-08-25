import js from "@eslint/js";
import globals from "globals";

export default [
  // Files ESLint should never look at.
  {
    ignores: ["node_modules/**", "coverage/**"],
  },

  // Base rules for every .js file in the Backend.
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // package.json has "type": "module"
      globals: {
        ...globals.node, // process, console, __dirname-ish, etc.
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // Express error handlers must declare 4 args (err, req, res, next)
      // even when `next` is unused, so don't fail the build on those.
      "no-unused-vars": ["error", { argsIgnorePattern: "^_|^next$" }],

      // A few small "teach good habits" rules.
      "no-console": "off",
      eqeqeq: ["warn", "smart"],
    },
  },

  // Test files additionally get the node:test globals.
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
