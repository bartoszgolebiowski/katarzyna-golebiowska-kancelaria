#!/usr/bin/env node
/**
 * lib/server.mjs
 * Lokalny serwer HTTP serwujący statyczną stronę.
 *
 *   /          → public/          (HTML/CSS/JS + assets)
 *
 * PDFy otrzymują nagłówek X-Robots-Tag: noindex, nofollow.
 *
 * Użycie:
 *   node lib/server.mjs
 *   PORT=8080 node lib/server.mjs
 */
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT   = process.env.PORT || 3000;
const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const MIME = {
  ".html":  "text/html; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".json":  "application/json; charset=utf-8",
  ".xml":   "application/xml; charset=utf-8",
  ".txt":   "text/plain; charset=utf-8",
  ".svg":   "image/svg+xml",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".webp":  "image/webp",
  ".ico":   "image/x-icon",
  ".pdf":   "application/pdf",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
  ".ttf":   "font/ttf",
};

/**
 * Tłumaczy URL na ścieżkę w systemie plików.
 *
 *  /* → PUBLIC/*
 */
function resolve(urlPath) {
  return path.join(PUBLIC, urlPath);
}

function isAllowed(filePath) {
  return filePath.startsWith(PUBLIC);
}

const server = http.createServer(async (req, res) => {
  const ts = new Date().toLocaleTimeString();

  let urlPath = req.url.split("?")[0];
  try { urlPath = decodeURIComponent(urlPath); } catch { /* ignore */ }

  if (urlPath.endsWith("/")) urlPath += "index.html";

  const filePath = resolve(urlPath);

  if (!isAllowed(filePath)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403: Forbidden");
    return;
  }

  try {
    if (!existsSync(filePath)) {
      console.log(`[${ts}] ❌ 404  ${urlPath}`);
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404: Nie znaleziono pliku");
      return;
    }

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      res.writeHead(301, { Location: req.url.split("?")[0] + "/" });
      res.end();
      return;
    }

    const ext     = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type":  MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    };
    if (ext === ".pdf") headers["X-Robots-Tag"] = "noindex, nofollow";

    console.log(`[${ts}] ✅ 200  ${urlPath}`);
    res.writeHead(200, headers);
    res.end(await fs.readFile(filePath));
  } catch (err) {
    console.error(`[${ts}] 🔴 500  ${urlPath}:`, err.message);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500: Błąd serwera");
  }
});

server.listen(PORT, () => {
  console.log(`\n💻 Serwer deweloperski`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`   /          → public/  (zawiera HTML, CSS, JS i assets)`);
  console.log(`   /assets/*  → public/assets/  (PDFy: X-Robots-Tag: noindex, nofollow)`);
  console.log(`\nCtrl+C aby zatrzymać.\n`);

  if (!existsSync(path.join(PUBLIC, "index.html"))) {
    console.warn(`⚠️  Brak public/index.html — uruchom najpierw: npm run build:site\n`);
  }
});
