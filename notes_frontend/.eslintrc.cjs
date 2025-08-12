module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "qwik"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:qwik/recommended"
  ],
  ignorePatterns: ["node_modules/", "dist/", "server/", "tmp/"],
  rules: {
    "qwik/valid-lexical-scope": "off",
    "@typescript-eslint/no-explicit-any": "off"
  },
};
