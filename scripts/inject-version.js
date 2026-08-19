#!/usr/bin/env node
/**
 * Writes the package.json version into .env.local as REACT_APP_VERSION,
 * so CRA inlines it into the build and it can be logged at runtime.
 * Runs automatically before `start`/`build` (see package.json pre* hooks).
 * Cross-platform on purpose - avoids shell-specific env var syntax.
 */

const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const envLocalPath = path.join(__dirname, "..", ".env.local");

const line = `REACT_APP_VERSION=${pkg.version}\n`;

let existing = "";
if (fs.existsSync(envLocalPath)) {
  existing = fs
    .readFileSync(envLocalPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("REACT_APP_VERSION="))
    .join("\n");
  if (existing && !existing.endsWith("\n")) existing += "\n";
}

fs.writeFileSync(envLocalPath, existing + line);
console.log(`Injected REACT_APP_VERSION=${pkg.version} into .env.local`);
