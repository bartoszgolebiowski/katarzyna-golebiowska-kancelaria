import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { createEmptyHeaderTemplate, createPdfFooterTemplate, createPdfHtml } from "./template.js";

export { brand } from "./brand.js";
export { createEmptyHeaderTemplate, createPdfFooterTemplate, createPdfHtml } from "./template.js";

export async function generatePdfFromHtml({
  contentHtml,
  outputPath,
  title,
  description,
  documentDate,
  siteRoot,
  watermarkText,
  watermarkOpacity,
  metaItems,
  launchOptions = {},
  pdfOptions = {}
}) {
  if (!outputPath) {
    throw new Error("Missing outputPath. Provide a target PDF path.");
  }

  const html = createPdfHtml({
    contentHtml,
    title,
    description,
    documentDate,
    siteRoot,
    watermarkText,
    watermarkOpacity,
    metaItems
  });

  await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ...launchOptions
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: createEmptyHeaderTemplate(),
      footerTemplate: createPdfFooterTemplate({ siteRoot }),
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "36mm",
        left: "15mm"
      },
      ...pdfOptions
    });

    let attempts = 5;
    while (attempts > 0) {
      try {
        await fs.writeFile(outputPath, pdfBuffer);
        break;
      } catch (error) {
        attempts -= 1;
        if (attempts === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await browser.close();
  }

  return path.resolve(outputPath);
}

export async function generatePdfFromFile({ inputPath, outputPath, ...options }) {
  if (!inputPath) {
    throw new Error("Missing inputPath. Provide an HTML fragment file.");
  }

  const contentHtml = await fs.readFile(inputPath, "utf8");
  return generatePdfFromHtml({ contentHtml, outputPath, ...options });
}

export async function renderHtmlFromFile({ inputPath, outputPath, ...options }) {
  if (!inputPath) {
    throw new Error("Missing inputPath. Provide an HTML fragment file.");
  }

  const contentHtml = await fs.readFile(inputPath, "utf8");
  const html = createPdfHtml({ contentHtml, ...options });

  if (outputPath) {
    await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await fs.writeFile(outputPath, html, "utf8");
  }

  return html;
}