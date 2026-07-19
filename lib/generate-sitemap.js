#!/usr/bin/env node
/**
 * lib/generate-sitemap.js
 * Generuje sitemap.xml na podstawie plików HTML w public/.
 *
 * Użycie (wywoływany przez build-site.js):
 *   node lib/generate-sitemap.js [<public-dir>]
 */
import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, "..");
const PUBLIC_DIR = process.argv[2] || path.join(ROOT, "public");
const DOMAIN     = "https://kieleckinotariusz.pl";

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getFileDate(filePath) {
  try {
    const gitDate = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      cwd: ROOT, encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"]
    }).trim();
    if (gitDate) return formatDate(new Date(gitDate));
  } catch { /* fallback */ }
  try { return formatDate(new Date(statSync(filePath).mtime)); } catch { return formatDate(new Date()); }
}

async function findHtmlFiles(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath));
    } else if (entry.name.endsWith(".html")) {
      files.push({ path: fullPath, url: path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, "/") });
    }
  }
  return files;
}

async function main() {
  const htmlFiles = await findHtmlFiles(PUBLIC_DIR);
  if (!htmlFiles.length) { console.error("❌ Brak plików HTML."); process.exit(1); }

  // deduplicate + sort
  const seen = new Set();
  const pages = htmlFiles
    .filter(f => { if (seen.has(f.url)) return false; seen.add(f.url); return true; })
    .sort((a, b) => {
      if (a.url === "index.html") return -1;
      if (b.url === "index.html") return 1;
      const aB = a.url.includes("baza-wiedzy/"), bB = b.url.includes("baza-wiedzy/");
      return (!aB && bB) ? -1 : (aB && !bB) ? 1 : a.url.localeCompare(b.url);
    });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  let lastCategory = null;

  for (const page of pages) {
    let urlPath = page.url;
    if (urlPath === "index.html") urlPath = "";
    else if (urlPath.endsWith("/index.html")) urlPath = urlPath.slice(0, -"index.html".length);

    const category = page.url.includes("baza-wiedzy/") ? "baza-wiedzy" : "main";
    if (category !== lastCategory && lastCategory !== null) xml += "\n";
    lastCategory = category;

    xml += `  <url>\n    <loc>${urlPath ? `${DOMAIN}/${urlPath}` : DOMAIN}</loc>\n    <lastmod>${getFileDate(page.path)}</lastmod>\n  </url>\n`;
  }
  xml += "\n</urlset>\n";

  await fs.writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), xml, "utf-8");
  console.log(`✅ sitemap.xml → ${pages.length} URL-i`);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
