#!/usr/bin/env node
import path from "node:path";
import { renderHtmlFromFile } from "../src/index.js";

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

const args = parseArgs(process.argv.slice(2));

if (!args.input || !args.output) {
  console.log("Usage: node bin/render-html.js --input examples/content.html --output dist/example.html --title \"Tytul dokumentu\"");
  process.exit(1);
}

try {
  await renderHtmlFromFile({
    inputPath: path.resolve(args.input),
    outputPath: path.resolve(args.output),
    title: args.title || "Dokument",
    documentDate: args.date || new Date(),
    siteRoot: args["site-root"] ? path.resolve(args["site-root"]) : undefined,
    watermarkText: args.watermark,
    watermarkOpacity: args.opacity ? Number(args.opacity) : undefined,
    metaItems: args.meta ? [args.meta] : []
  });

  console.log(`HTML created: ${path.resolve(args.output)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}