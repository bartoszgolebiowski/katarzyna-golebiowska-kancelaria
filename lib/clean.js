#!/usr/bin/env node
/**
 * lib/clean.js
 * Usuwa artefakty buildu z public/, zachowując assets/, llms.txt i robots.txt.
 *
 * Użycie:
 *   node lib/clean.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const KEEP = new Set(["assets", "llms.txt", "robots.txt"]);

console.log("🧹 Czyszczenie artefaktów...");

if (fs.existsSync(PUBLIC)) {
  const entries = fs.readdirSync(PUBLIC, { withFileTypes: true });
  
  for (const entry of entries) {
    if (KEEP.has(entry.name)) {
      console.log(`   ✅ Zachowano: public/${entry.name}`);
      continue;
    }
    
    const fullPath = path.join(PUBLIC, entry.name);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`   🗑️  public/${entry.name}`);
  }
} else {
  console.log("   ℹ️  Katalog public/ nie istnieje");
}

console.log("✨ Gotowe.");
