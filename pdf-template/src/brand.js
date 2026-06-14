import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(currentFile), "..");
const defaultSiteRoot = path.resolve(packageRoot, "..");

export const brand = {
  siteName: "Kancelaria Notarialna Katarzyna Golebiowska",
  displayName: "Kancelaria Notarialna Katarzyna Gołębiowska",
  watermarkName: "Kancelaria Katarzyna Gołębiowska",
  city: "Kielce",
  addressLine: "ul. Świętego Leonarda 16/7, 25-304 Kielce",
  entrance: "wejście od ul. Wesołej",
  hoursLine: "Pn-Pt: 09:00 - 16:00 | Sb: 10:00 - 12:00",
  weekdayHours: "Poniedziałek - Piątek: 09:00 - 16:00",
  saturdayHours: "Sobota: 10:00 - 12:00",
  phone: "(41) 361 36 00",
  mobile: "+48 789 741 377",
  email: "kancelaria@kieleckinotariusz.pl",
  website: "kieleckinotariusz.pl",
  colors: {
    ink: "#4d2c26",
    inkSoft: "#3b241f",
    inkMuted: "#70544d",
    gold: "#c2b4a3",
    goldLight: "#ded5c9",
    paper: "#eae3d9",
    warmPaper: "#f0e9df",
    white: "#f5f5f5",
    text: "#2d2926",
    line: "#d0c1af",
    accent: "#a0614f"
  }
};

const fontFiles = [
  {
    weight: 400,
    file: "S6uyw4BMUTPHjxAwXjeu.woff2",
    unicodeRange:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
  },
  {
    weight: 400,
    file: "S6uyw4BMUTPHjx4wXg.woff2",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
  },
  {
    weight: 700,
    file: "S6u9w4BMUTPHh6UVSwaPGR_p.woff2",
    unicodeRange:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
  },
  {
    weight: 700,
    file: "S6u9w4BMUTPHh6UVSwiPGQ.woff2",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
  },
  {
    weight: 900,
    file: "S6u9w4BMUTPHh50XSwaPGR_p.woff2",
    unicodeRange:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
  },
  {
    weight: 900,
    file: "S6u9w4BMUTPHh50XSwiPGQ.woff2",
    unicodeRange:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
  }
];

export function getSiteRoot(siteRoot = defaultSiteRoot) {
  return path.resolve(siteRoot);
}

export function getLogoPath(siteRoot) {
  return path.join(getSiteRoot(siteRoot), "assets", "logo.svg");
}

export function readAssetAsDataUri(filePath, mimeType) {
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString("base64")}`;
}

export function createLatoFontCss(siteRoot) {
  const fontsRoot = path.join(getSiteRoot(siteRoot), "assets", "fonts");

  return fontFiles
    .map((fontFile) => {
      const fontPath = path.join(fontsRoot, fontFile.file);
      const fontData = readAssetAsDataUri(fontPath, "font/woff2");

      return `@font-face {
  font-family: "Lato";
  font-style: normal;
  font-weight: ${fontFile.weight};
  font-display: swap;
  src: url("${fontData}") format("woff2");
  unicode-range: ${fontFile.unicodeRange};
}`;
    })
    .join("\n");
}