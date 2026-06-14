#!/usr/bin/env node
/**
 * lib/clean.js
 * Usuwa wszystkie artefakty buildu: public/ oraz assets/pdf/.
 *
 * Użycie:
 *   node lib/clean.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  path.join(ROOT, "public"),
  path.join(ROOT, "assets", "pdf"),
];

console.log("🧹 Czyszczenie artefaktów...");

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`   🗑️  ${path.relative(ROOT, target)}/`);
  }
}

console.log("✨ Gotowe.");
