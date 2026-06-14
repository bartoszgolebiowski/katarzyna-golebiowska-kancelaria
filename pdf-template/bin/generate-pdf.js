#!/usr/bin/env node
import path from "node:path";
import { generatePdfFromFile } from "../src/index.js";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const nextValue = argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = nextValue;
    index += 1;
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node bin/generate-pdf.js --input examples/content.html --output dist/document.pdf --title "Tytul dokumentu"

Options:
  --input       HTML fragment to inject into the branded template
  --output      Target PDF file path
  --title       Document title shown above injected content
  --date        Document date, e.g. 2026-06-14
  --meta        Additional meta line under title. Can be repeated in npm scripts by calling the API.
  --watermark   Optional watermark text
  --opacity     Watermark opacity from 0.02 to 0.12
  --site-root   Optional path to the website root with assets/logo.svg and assets/fonts/
`);
}

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.input || !args.output) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

try {
  const pdfPath = await generatePdfFromFile({
    inputPath: path.resolve(args.input),
    outputPath: path.resolve(args.output),
    title: args.title || "Dokument",
    documentDate: args.date || new Date(),
    siteRoot: args["site-root"] ? path.resolve(args["site-root"]) : undefined,
    watermarkText: args.watermark,
    watermarkOpacity: args.opacity ? Number(args.opacity) : undefined,
    metaItems: args.meta ? [args.meta] : []
  });

  console.log(`PDF created: ${pdfPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}