#!/usr/bin/env node
/**
 * lib/build-pdf.js
 * Generuje wszystkie pliki PDF z szablonów dokumentów do assets/pdf/.
 *
 * Użycie:
 *   node lib/build-pdf.js           → generuje tylko brakujące PDFy
 *   node lib/build-pdf.js --force   → nadpisuje wszystkie PDFy
 */
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePdfFromHtml } from "../pdf-template/src/index.js";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, "..");
const SITE_SRC   = path.join(ROOT, "site-src");
const ASSETS_PDF = path.join(ROOT, "public","assets", "pdf");
const FORCE      = process.argv.includes("--force") || process.argv.includes("--force-pdf");

// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content };
  const data = {};
  let currentKey = null, currentValue = [];
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1 && !line.startsWith(" ")) {
      if (currentKey) data[currentKey] = currentValue.join("\n").trim();
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      currentKey = key;
      if (value === "|") { currentValue = []; } else { data[key] = value.replace(/^["']|["']$/g, ""); currentKey = null; }
    } else if (currentKey !== null) { currentValue.push(line); }
  }
  if (currentKey) data[currentKey] = currentValue.join("\n").trim();
  return { data, content: match[2] };
}

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

// ---------------------------------------------------------------------------

async function main() {
  console.log(`📄 Generowanie PDF-ów${FORCE ? " (tryb --force)" : ""}...`);
  await fs.mkdir(ASSETS_PDF, { recursive: true });

  const docsDir    = path.join(SITE_SRC, "documents");
  const docFolders = (await fs.readdir(docsDir, { withFileTypes: true }))
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  let generated = 0, skipped = 0;

  for (const folder of docFolders) {
    const categoryPath = path.join(docsDir, folder.name);
    const metaPath     = path.join(categoryPath, "meta.json");
    if (!existsSync(metaPath)) continue;

    const meta          = JSON.parse(await fs.readFile(metaPath, "utf8"));
    const categoryTitle = meta.title;
    const subFiles      = (await fs.readdir(categoryPath)).filter(f => f.endsWith(".html")).sort();

    console.log(`\n📂 ${categoryTitle}`);

    for (const subFilename of subFiles) {
      const rawSub = await fs.readFile(path.join(categoryPath, subFilename), "utf8");
      const { data: subMeta, content: subContent } = parseFrontmatter(rawSub);
      const subTitle  = subMeta.title || subFilename.replace(".html", "");
      const pdfTitle  = subMeta.pdf_title || `Wykaz dokumentów – ${categoryTitle} – ${subTitle}`;
      const pdfSlug   = `${slugify(categoryTitle)}-${slugify(subTitle)}.pdf`;
      const pdfPath   = path.join(ASSETS_PDF, pdfSlug);

      if (!FORCE && existsSync(pdfPath)) {
        console.log(`   ⏭️  ${pdfSlug} (istnieje)`);
        skipped++;
        continue;
      }

      console.log(`   📄 Generuję: ${pdfSlug}`);
      try {
        await generatePdfFromHtml({
          contentHtml: `
            <p class="pdf-lead">Poniżej znajduje się wykaz dokumentów i informacji zazwyczaj wymaganych do przygotowania czynności notarialnej. Ostateczny zestaw dokumentów zależy od indywidualnych ustaleń i sytuacji prawnej stron.</p>
            <section class="pdf-section">
              <h2>Wymagane dokumenty</h2>
              ${subContent.trim()}
            </section>
            <div class="pdf-notes-section">
              <div class="pdf-notes-title">Notatki / Uwagi</div>
              <div class="pdf-notes-line"></div>
              <div class="pdf-notes-line"></div>
              <div class="pdf-notes-line"></div>
              <div class="pdf-notes-line"></div>
            </div>`,
          outputPath: pdfPath,
          title: pdfTitle,
          siteRoot: ROOT,
          metaItems: ["Kancelaria Notarialna Katarzyna Gołębiowska", "Kielce"],
          watermarkOpacity: 0.045,
        });
        generated++;
      } catch (err) {
        console.error(`   ❌ Błąd: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Gotowe — wygenerowano: ${generated}, pominięto: ${skipped}`);
  console.log(`📁 Pliki PDF: assets/pdf/`);
}

main().catch(console.error);
