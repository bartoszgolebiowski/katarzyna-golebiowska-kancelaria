# Kancelaria PDF Template

Standalone JavaScript package for generating branded PDF files from an HTML fragment.

The template uses the same visual language as the website's knowledge base (baza wiedzy): Lato fonts from `assets/fonts`, the brown/parchment/accent palette from `style.css`, the existing `assets/logo.svg`, and a soft repeating watermark with the kancelaria name.

## Install

```bash
cd pdf-template
npm install
```

## Generate a PDF

Run the included example:

```bash
npm run pdf:example
```

Or inject your own HTML fragment:

```bash
npm run pdf -- --input path/to/content.html --output dist/document.pdf --title "Dokument dla klienta"
```

The injected file should be an HTML fragment, not a full `<!doctype html>` page. The package wraps it with the PDF document shell, styling, header, repeated footer, and watermark.

## Render the final HTML only

This is useful for checking the template in a browser before creating the PDF:

```bash
npm run pdf:html -- --input path/to/content.html --output dist/document.html --title "Dokument dla klienta"
```

## JavaScript API

```js
import { generatePdfFromHtml } from "./src/index.js";

await generatePdfFromHtml({
  title: "Dokument dla klienta",
  outputPath: "dist/document.pdf",
  contentHtml: `
    <p class="pdf-lead">Treść wprowadzająca.</p>
    <section class="pdf-section">
      <h2>Zakres sprawy</h2>
      <p>Dowolny HTML do wstrzyknięcia do szablonu.</p>
    </section>
  `,
  metaItems: ["Numer sprawy: KG/1/2026"],
  watermarkText: "Kancelaria Katarzyna Gołębiowska",
  watermarkOpacity: 0.045
});
```

## Footer Content

The PDF footer repeats on every page and includes the key information from the website topline:

- office name and address,
- entrance information,
- weekday and Saturday hours,
- phone numbers,
- e-mail address,
- website and page numbering.

## Custom Inputs

- `title` - title shown above the injected content,
- `contentHtml` - raw HTML fragment to inject,
- `outputPath` - target PDF path,
- `documentDate` - date shown in document metadata,
- `metaItems` - additional metadata lines under the title,
- `watermarkText` - repeated watermark text,
- `watermarkOpacity` - watermark strength, clamped from `0.02` to `0.12`,
- `siteRoot` - optional path to the website root if this package is moved elsewhere.

The default `siteRoot` is the parent folder of `pdf-template`, so the package can use the existing website assets without duplicating them.
