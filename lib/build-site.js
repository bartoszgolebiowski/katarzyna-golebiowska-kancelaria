#!/usr/bin/env node
/**
 * lib/build-site.js
 * Kompiluje statyczną stronę (HTML/CSS/JS) do katalogu public/.
 * PDFy są generowane osobno przez lib/build-pdf.js.
 *
 * Użycie:
 *   node lib/build-site.js           → build + start serwera
 *   node lib/build-site.js --no-serve → tylko build
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, "..");
const SITE_SRC = path.join(ROOT, "site-src");
const PUBLIC   = path.join(ROOT, "public");

// ---------------------------------------------------------------------------
// Parsery
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const data = {};
  let currentKey = null;
  let currentValue = [];

  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1 && !line.startsWith(" ")) {
      if (currentKey) data[currentKey] = currentValue.join("\n").trim();
      const key   = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      currentKey  = key;
      if (value === "|") {
        currentValue = [];
      } else {
        data[key] = value.replace(/^["']|["']$/g, "");
        currentKey = null;
      }
    } else if (currentKey !== null) {
      currentValue.push(line);
    }
  }
  if (currentKey) data[currentKey] = currentValue.join("\n").trim();

  return { data, content: match[2] };
}

function parseHtmlArticleFile(htmlContent) {
  const get = (re) => { const m = htmlContent.match(re); return m ? m[1].trim() : ""; };

  const schemaRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let schema_json = "";
  let m;
  while ((m = schemaRegex.exec(htmlContent)) !== null) {
    schema_json += `<script type="application/ld+json">${m[1].trim()}</script>\n`;
  }

  return {
    data: {
      title:       get(/<title>([\s\S]*?)<\/title>/i),
      description: get(/<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/?>/i)
                || get(/<meta\s+content="([\s\S]*?)"\s+name="description"\s*\/?>/i),
      robots:      get(/<meta\s+name="robots"\s+content="([\s\S]*?)"\s*\/?>/i) || "index, follow",
      canonical:   get(/<link\s+rel="canonical"\s+href="([\s\S]*?)"\s*\/?>/i),
      og_type:     "article",
      og_image:    "https://kieleckinotariusz.pl/assets/images/notariusz.jpg",
      schema_json,
    },
    content: get(/<main\s+id="main">([\s\S]*?)<\/main>/i) || htmlContent,
  };
}

// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------

function compileTemplate(layout, partials, pageData, relativeRoot, activeLinkName) {
  let html = layout.replaceAll("{{relativeRoot}}", relativeRoot);

  html = html
    .replaceAll("{{title}}",       pageData.title       || "Kancelaria Notarialna Katarzyna Gołębiowska")
    .replaceAll("{{description}}", pageData.description || "")
    .replaceAll("{{robots}}",      pageData.robots      || "index, follow")
    .replaceAll("{{canonical}}",   pageData.canonical   || "")
    .replaceAll("{{og_type}}",     pageData.og_type     || "website")
    .replaceAll("{{og_image}}",    pageData.og_image    || `${relativeRoot}assets/images/notariusz.jpg`)
    .replaceAll("{{schema_json}}", pageData.schema_json || "");

  let headerHtml = partials.header.replaceAll("{{relativeRoot}}", relativeRoot);
  if (activeLinkName) {
    // Link do strony głównej wskazuje na sam katalog root (bez index.html),
    // żeby być spójny z canonical URL strony głównej.
    const targetHref = activeLinkName === "index.html"
      ? `href="${relativeRoot}"`
      : `href="${relativeRoot}${activeLinkName}"`;
    headerHtml = headerHtml.replace(targetHref, `${targetHref} aria-current="page"`);
  }
  html = html.replaceAll("{{header}}", headerHtml);
  html = html.replaceAll("{{footer}}", partials.footer.replaceAll("{{relativeRoot}}", relativeRoot));
  html = html.replaceAll("{{content}}", pageData.content.replaceAll("{{relativeRoot}}", relativeRoot));

  return html;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, "-")
    .replace(/[áàäâãåą]/g, "a").replace(/[éèëêę]/g, "e")
    .replace(/[íìïî]/g, "i").replace(/[óòöôõ]/g, "o")
    .replace(/[úùüû]/g, "u").replace(/[ñ]/g, "n")
    .replace(/[çć]/g, "c").replace(/[ł]/g, "l")
    .replace(/[ś]/g, "s").replace(/[źż]/g, "z")
    .replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");
}

async function walk(dir) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, entry.name);
    files = entry.isDirectory() ? files.concat(await walk(res)) : [...files, res];
  }
  return files;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 Budowanie strony...");

  await fs.mkdir(PUBLIC, { recursive: true });

  // 1. Layout i partials
  const layout   = await fs.readFile(path.join(SITE_SRC, "layouts/default.html"), "utf8");
  const partials  = {
    header: await fs.readFile(path.join(SITE_SRC, "partials/header.html"), "utf8"),
    footer: await fs.readFile(path.join(SITE_SRC, "partials/footer.html"), "utf8"),
  };

  // 2. Dokumenty → akordeony (bez generowania PDF – to robi build-pdf.js)
  console.log("📂 Kompilacja dokumentów i akordeonów...");
  const docsDir    = path.join(SITE_SRC, "documents");
  const docFolders = (await fs.readdir(docsDir, { withFileTypes: true }))
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  let accordionListHtml = "";

  for (const folder of docFolders) {
    const categoryPath = path.join(docsDir, folder.name);
    const metaPath     = path.join(categoryPath, "meta.json");
    if (!existsSync(metaPath)) { console.warn(`⚠️  Brak meta.json w ${folder.name}. Pomijam.`); continue; }

    const meta          = JSON.parse(await fs.readFile(metaPath, "utf8"));
    const categoryTitle = meta.title;
    const subFiles      = (await fs.readdir(categoryPath))
      .filter(f => f.endsWith(".html"))
      .sort();

    console.log(`   - ${categoryTitle} (${subFiles.length})`);

    const subcategoryBlocks = [];

    for (const subFilename of subFiles) {
      const rawSub = await fs.readFile(path.join(categoryPath, subFilename), "utf8");
      const { data: subMeta, content: subContent } = parseFrontmatter(rawSub);
      const subTitle  = subMeta.title || subFilename.replace(".html", "");
      const pdfSlug   = `${slugify(categoryTitle)}-${slugify(subTitle)}.pdf`;

      const downloadStrip = `
        <div class="pdf-download-strip" style="margin-top:1.25rem;padding-top:1rem;border-top:1px dashed var(--line);">
          <a href="{{relativeRoot}}assets/pdf/${pdfSlug}" class="pdf-download-btn" download>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Pobierz wykaz dokumentów (PDF)
          </a>
        </div>`;

      subcategoryBlocks.push({ title: subTitle, content: subContent.trim() + downloadStrip, pdfSlug });
    }

    let categoryHtml = "";
    if (subcategoryBlocks.length === 1 && (subcategoryBlocks[0].title === categoryTitle || subFiles[0].includes("01-"))) {
      categoryHtml = `
        <!-- ${categoryTitle.toUpperCase()} -->
        <details data-key="${folder.name}">
          <summary>
            <span>${categoryTitle}</span>
            <a href="{{relativeRoot}}assets/pdf/${subcategoryBlocks[0].pdfSlug}" class="summary-download-btn" onclick="event.stopPropagation()" download title="Pobierz wykaz jako PDF">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Pobierz wykaz</span>
            </a>
          </summary>
          <div class="details-body">${subcategoryBlocks[0].content}</div>
        </details>`;
    } else {
      const nestedHtml = subcategoryBlocks.map(sub => `
        <details>
          <summary>
            <span>${sub.title}</span>
            <a href="{{relativeRoot}}assets/pdf/${sub.pdfSlug}" class="summary-download-btn" onclick="event.stopPropagation()" download title="Pobierz wykaz jako PDF">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Pobierz wykaz</span>
            </a>
          </summary>
          <div class="details-body">${sub.content}</div>
        </details>`).join("\n");

      categoryHtml = `
        <!-- ${categoryTitle.toUpperCase()} -->
        <details data-key="${folder.name}">
          <summary>${categoryTitle}</summary>
          <div class="details-body"><div class="accordion-nested">${nestedHtml}</div></div>
        </details>`;
    }

    accordionListHtml += categoryHtml + "\n";
  }

  // 3. Główne strony
  console.log("📄 Kompilacja podstron...");
  for (const filename of await fs.readdir(path.join(SITE_SRC, "pages"))) {
    if (!filename.endsWith(".html")) continue;
    console.log(`   - ${filename}`);
    let rawContent = await fs.readFile(path.join(SITE_SRC, "pages", filename), "utf8");
    if (filename === "dokumenty.html") rawContent = rawContent.replace("<!-- DYNAMIC_ACCORDIONS -->", accordionListHtml);
    const { data, content } = parseFrontmatter(rawContent);
    await fs.writeFile(path.join(PUBLIC, filename), compileTemplate(layout, partials, { ...data, content }, "./", filename), "utf8");
  }

  // 4. Artykuły bazy wiedzy
  console.log("✍️  Kompilacja bazy wiedzy...");
  const articlesSrcDir = path.join(SITE_SRC, "baza-wiedzy");
  if (existsSync(articlesSrcDir)) {
    for (const articleFilePath of await walk(articlesSrcDir)) {
      if (!articleFilePath.endsWith(".html")) continue;
      const rel = path.relative(articlesSrcDir, articleFilePath);
      console.log(`   - baza-wiedzy/${rel.replace(/\\/g, "/")}`);
      const outPath = path.join(PUBLIC, "baza-wiedzy", rel);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      const rawArticle = await fs.readFile(articleFilePath, "utf8");
      
      const depth = rel.split(path.sep).length;
      const relativeRoot = "../".repeat(depth);

      let parsed = rawArticle.trim().startsWith("---") ? parseFrontmatter(rawArticle) : parseHtmlArticleFile(rawArticle);
      await fs.writeFile(outPath, compileTemplate(layout, partials, { ...parsed.data, content: parsed.content }, relativeRoot, "baza-wiedzy.html"), "utf8");
    }
  }

  // 5. Sitemap
  console.log("🗺️  Generowanie sitemap.xml...");
  try {
    execSync(`node "${path.join(__dirname, "generate-sitemap.js")}" "${PUBLIC}"`, { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Błąd sitemap:", e.message);
  }

  console.log("\n✅ Strona zbudowana pomyślnie → public/");
}

main().catch(console.error);
