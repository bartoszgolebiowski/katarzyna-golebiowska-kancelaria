import { brand, createLatoFontCss, getLogoPath, readAssetAsDataUri } from "./brand.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitWatermarkText(text) {
  const normalizedText = String(text || brand.watermarkName).trim();

  if (normalizedText.startsWith("Kancelaria ")) {
    return ["Kancelaria", normalizedText.slice("Kancelaria ".length)];
  }

  return [normalizedText];
}

function createWatermarkDataUri({ logoDataUri, text = brand.watermarkName, opacity = 0.045 } = {}) {
  const clampedOpacity = Math.min(Math.max(Number(opacity) || 0.045, 0.02), 0.12);
  const logoOpacity = Math.max(clampedOpacity - 0.02, 0.025);
  const lines = splitWatermarkText(text);
  const textMarkup = lines
    .slice(0, 2)
    .map((line, index) => {
      const y = lines.length === 1 ? 101 : 88 + index * 23;
      return `<text x="108" y="${y}" font-family="Lato, Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="${brand.colors.ink}" opacity="${clampedOpacity}">${escapeHtml(line)}</text>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="230" viewBox="0 0 360 230">
  <g transform="rotate(-28 180 115)">
    <image href="${logoDataUri}" x="40" y="66" width="54" height="54" opacity="${logoOpacity}" />
    ${textMarkup}
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function createBaseStyles({ fontCss, logoDataUri, watermarkDataUri }) {
  return `${fontCss}

:root {
  --ink: ${brand.colors.ink};
  --ink-soft: ${brand.colors.inkSoft};
  --ink-muted: ${brand.colors.inkMuted};
  --gold: ${brand.colors.gold};
  --gold-light: ${brand.colors.goldLight};
  --paper: ${brand.colors.paper};
  --warm-paper: ${brand.colors.warmPaper};
  --white: ${brand.colors.white};
  --text: ${brand.colors.text};
  --line: ${brand.colors.line};
  --accent: ${brand.colors.accent};
  --sans: "Lato", "Segoe UI", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  position: relative;
  color: var(--text);
  font-family: var(--sans);
  font-size: 12.5px;
  line-height: 1.65;
  background-color: #fffdfa;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@page {
  size: A4;
}

h1,
h2,
h3,
h4,
p,
ul,
ol,
table,
blockquote {
  margin-top: 0;
}

h1,
h2,
h3,
h4 {
  color: var(--ink);
  font-weight: 700;
  line-height: 1.2;
}

h1 {
  margin-bottom: 14px;
  font-size: 28px;
}

h2 {
  margin: 28px 0 12px;
  padding-left: 12px;
  border-left: 3px solid var(--gold);
  font-size: 19px;
}

h3 {
  margin: 20px 0 8px;
  font-size: 15px;
}

p {
  margin-bottom: 11px;
}

a {
  color: var(--accent);
  text-decoration: none;
}

ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 14px;
}

ul li {
  position: relative;
  padding-left: 20px;
  margin: 0.4em 0;
}

ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 11px;
  height: 11px;
  border: 1.2px solid var(--ink-muted);
  border-radius: 2px;
  background-color: var(--white);
}

ul ul {
  padding-left: 20px;
  margin-top: 6px;
}

ol {
  margin-bottom: 14px;
  padding-left: 1.5em;
}

ol li {
  margin: 0.28em 0;
}

table {
  width: 100%;
  margin: 18px 0;
  border-collapse: collapse;
  background: rgba(245, 245, 245, 0.82);
  page-break-inside: avoid;
}

th,
td {
  padding: 8px 10px;
  border: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

th {
  color: var(--ink);
  background: var(--warm-paper);
  font-weight: 700;
}

blockquote,
.pdf-callout {
  margin: 18px 0;
  padding: 14px 16px;
  color: var(--ink-muted);
  background: rgba(240, 233, 223, 0.9);
  border-left: 3px solid var(--gold);
  border-radius: 0 6px 6px 0;
  page-break-inside: avoid;
}

.pdf-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.pdf-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  margin-bottom: 30px;
  color: rgba(245, 245, 245, 0.78);
  background: var(--ink);
  border-bottom: 3px solid rgba(194, 180, 163, 0.74);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.pdf-brand {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px 22px;
}

.pdf-brand__mark {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  background-color: var(--white);
  background-image: url("${logoDataUri}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  border-radius: 8px;
}

.pdf-brand__text {
  display: grid;
  gap: 2px;
}

.pdf-brand__text strong {
  color: var(--white);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
}

.pdf-brand__text span {
  color: rgba(245, 245, 245, 0.75);
  font-size: 11px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.pdf-topline {
  display: grid;
  align-content: center;
  gap: 4px;
  min-width: 232px;
  padding: 16px 22px;
  color: rgba(245, 245, 245, 0.86);
  background: var(--ink-soft);
  font-size: 10.5px;
}

.pdf-topline strong {
  color: var(--white);
}

.pdf-document-title {
  margin-bottom: 8px;
  color: var(--ink);
  font-size: 28px;
}

.pdf-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  color: var(--ink-muted);
  border-bottom: 2px solid var(--gold-light);
  font-size: 11px;
}

.pdf-content {
  position: relative;
  z-index: 1;
}

.pdf-content > :first-child {
  margin-top: 0;
}

.pdf-lead {
  margin-bottom: 22px;
  padding-bottom: 20px;
  color: var(--ink-muted);
  border-bottom: 2px solid var(--gold-light);
  font-size: 14px;
  line-height: 1.7;
}

.pdf-section {
  margin-bottom: 26px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.pdf-section:last-child {
  border-bottom: 0;
}

.pdf-signatures {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 26px;
  margin-top: 38px;
  page-break-inside: avoid;
}

.pdf-signature-line {
  padding-top: 34px;
  border-top: 1px solid var(--line);
  color: var(--ink-muted);
  text-align: center;
  font-size: 11px;
}
`;
}

function createFooterStyles(fontCss) {
  return `${fontCss}
  html,
  body {
    margin: 0;
    padding: 0;
    font-family: "Lato", "Segoe UI", Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .pdf-footer {
    width: 100%;
    padding: 5mm 15mm 10mm;
    color: rgba(245, 245, 245, 0.82);
    background: ${brand.colors.ink};
    border-top: 1.2mm solid ${brand.colors.accent};
    font-size: 9.8px;
    line-height: 1.4;
    box-sizing: border-box;
  }

  .pdf-footer__grid {
    display: grid;
    grid-template-columns: 1.25fr 1fr 1fr 0.6fr;
    gap: 5mm;
    align-items: start;
  }

  .pdf-footer strong {
    color: ${brand.colors.white};
    font-weight: 700;
  }

  .pdf-footer__label {
    display: block;
    margin-bottom: 1.5mm;
    color: ${brand.colors.goldLight};
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .pdf-footer__page {
    text-align: right;
    white-space: nowrap;
  }`;
}

export function createPdfHtml({
  contentHtml,
  title = "Dokument",
  description = "Dokument wygenerowany przez Kancelarię Notarialną Katarzyna Gołębiowska.",
  documentDate = new Date(),
  siteRoot,
  watermarkText = brand.watermarkName,
  watermarkOpacity = 0.045,
  metaItems = []
} = {}) {
  if (!contentHtml) {
    throw new Error("Missing contentHtml. Pass an HTML fragment to inject into the PDF template.");
  }

  const logoDataUri = readAssetAsDataUri(getLogoPath(siteRoot), "image/svg+xml");
  const fontCss = createLatoFontCss(siteRoot);
  const watermarkDataUri = createWatermarkDataUri({
    logoDataUri,
    text: watermarkText,
    opacity: watermarkOpacity
  });
  const generatedDate = new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(documentDate));
  const printableMetaItems = [
    `Data: ${generatedDate}`,
    ...metaItems.filter(Boolean)
  ];

  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | ${escapeHtml(brand.displayName)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>${createBaseStyles({ fontCss, logoDataUri, watermarkDataUri })}</style>
  </head>
  <body>
    <div class="pdf-page">
      <header class="pdf-header">
        <div class="pdf-brand">
          <span class="pdf-brand__mark" aria-hidden="true"></span>
          <div class="pdf-brand__text">
            <strong>Kancelaria Notarialna</strong>
            <span>Katarzyna Gołębiowska</span>
          </div>
        </div>
        <div class="pdf-topline">
          <div><strong>${escapeHtml(brand.city)}</strong>, ${escapeHtml(brand.addressLine)}</div>
          <div>${escapeHtml(brand.entrance)}</div>
          <div>${escapeHtml(brand.hoursLine)}</div>
        </div>
      </header>
      <main class="pdf-content" aria-label="Treść dokumentu PDF">
        <h1 class="pdf-document-title">${escapeHtml(title)}</h1>
        <div class="pdf-meta">${printableMetaItems
          .map((item) => `<span>${escapeHtml(item)}</span>`)
          .join("")}</div>
        ${contentHtml}
      </main>
    </div>
  </body>
</html>`;
}

export function createPdfFooterTemplate({ siteRoot } = {}) {
  const fontCss = createLatoFontCss(siteRoot);

  return `<style>${createFooterStyles(fontCss)}</style>
  <footer class="pdf-footer">
    <div class="pdf-footer__grid">
      <div>
        <span class="pdf-footer__label">Kancelaria</span>
        <strong>${escapeHtml(brand.displayName)}</strong><br />
        ${escapeHtml(brand.addressLine)}<br />
        ${escapeHtml(brand.entrance)}
      </div>
      <div>
        <span class="pdf-footer__label">Godziny</span>
        ${escapeHtml(brand.weekdayHours)}<br />
        ${escapeHtml(brand.saturdayHours)}<br />
        Wizyty poza godzinami po umówieniu
      </div>
      <div>
        <span class="pdf-footer__label">Kontakt</span>
        ${escapeHtml(brand.phone)}<br />
        ${escapeHtml(brand.mobile)}<br />
        ${escapeHtml(brand.email)}
      </div>
      <div class="pdf-footer__page">
        <span class="pdf-footer__label">PDF</span>
        ${escapeHtml(brand.website)}<br />
        Strona <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    </div>
  </footer>`;
}

export function createEmptyHeaderTemplate() {
  return `<span></span>`;
}