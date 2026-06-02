#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const DOMAIN = 'https://kieleckinotariusz.pl';
const ROOT_DIR = __dirname;

/**
 * Format date to YYYY-MM-DD for sitemap lastmod tag
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get git last commit date for a file, fallback to file modification time
 */
function getFileDate(filePath) {
  try {
    const gitDate = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    if (gitDate) {
      return formatDate(new Date(gitDate));
    }
  } catch (e) {
    // Git command failed, fallback to file stats
  }

  try {
    const stat = require('fs').statSync(filePath);
    return formatDate(new Date(stat.mtime));
  } catch (e) {
    return formatDate(new Date());
  }
}

/**
 * Recursively find all HTML files
 */
async function findHtmlFiles(dir, baseUrl = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    // Skip directories that shouldn't be included
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'assets') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      const subFiles = await findHtmlFiles(fullPath, baseUrl ? `${baseUrl}/${entry.name}` : entry.name);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push({
        name: entry.name,
        path: fullPath,
        relativePath: relativePath.replace(/\\/g, '/'),
        url: baseUrl ? `${baseUrl}/${entry.name}` : entry.name
      });
    }
  }

  return files;
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(pages) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

  // Normalize URLs and deduplicate
  const seenUrls = new Set();
  const uniquePages = [];

  for (const page of pages) {
    // Normalize: replace backslashes with forward slashes
    let normalizedUrl = page.url.replace(/\\/g, '/');
    
    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);
      uniquePages.push({
        ...page,
        url: normalizedUrl
      });
    }
  }

  // Sort: root first, then main pages, then blog articles
  uniquePages.sort((a, b) => {
    const aIsRoot = a.url === 'index.html';
    const bIsRoot = b.url === 'index.html';
    if (aIsRoot) return -1;
    if (bIsRoot) return 1;

    const aIsBlog = a.url.includes('blog/');
    const bIsBlog = b.url.includes('blog/');
    if (!aIsBlog && bIsBlog) return -1;
    if (aIsBlog && !bIsBlog) return 1;

    return a.url.localeCompare(b.url);
  });

  let lastCategory = null;

  for (const page of uniquePages) {
    // Convert index.html to directory URL
    let urlPath = page.url;
    if (urlPath === 'index.html') {
      urlPath = '';
    } else if (urlPath.endsWith('/index.html')) {
      urlPath = urlPath.substring(0, urlPath.length - 'index.html'.length);
    }

    const loc = urlPath ? `${DOMAIN}/${urlPath}` : DOMAIN;
    const lastmod = getFileDate(page.path);
    
    // Track category for visual separation
    const category = page.url.includes('blog/') ? 'blog' : 'main';
    if (category !== lastCategory && lastCategory !== null) {
      xml += '\n';
    }
    lastCategory = category;

    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `  </url>\n`;
  }

  xml += '\n</urlset>\n';
  return xml;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 Szukam plików HTML...');
    const htmlFiles = await findHtmlFiles(ROOT_DIR);

    if (htmlFiles.length === 0) {
      console.error('❌ Nie znaleziono plików HTML');
      process.exit(1);
    }

    console.log(`✅ Znaleziono ${htmlFiles.length} plików HTML`);
    console.log('\n📋 Pliki:');
    htmlFiles.forEach(file => {
      console.log(`   - ${file.url}`);
    });

    console.log('\n📅 Pobieranie dat modyfikacji...');
    const pages = htmlFiles.map(file => ({
      url: file.url,
      path: file.path,
      date: getFileDate(file.path)
    }));

    console.log('\n🔧 Generowanie sitemap.xml...');
    const sitemapXml = generateSitemapXml(pages);

    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemapXml, 'utf-8');

    console.log(`✅ Sitemap wygenerowany: sitemap.xml`);
    
    // Count unique URLs
    const uniqueUrls = new Set(htmlFiles.map(f => f.url.replace(/\\/g, '/')));
    console.log(`\n📊 Statystyka:\n   - Strony główne: ${htmlFiles.filter(p => !p.url.includes('/')).length}\n   - Strony blogowe: ${htmlFiles.filter(p => p.url.includes('/')).length}\n   - Razem: ${uniqueUrls.size}`);
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    process.exit(1);
  }
}

main();
