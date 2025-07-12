// FILE: scripts/generate-prerendered.mjs (Add fail-hard check)
// Replace the ENTIRE content of your existing script with this.

import fs from 'fs/promises'; // Use promises version
import fsSync from 'fs'; // Use sync version for the final check if preferred, or keep promises
import path from 'path';
import { fileURLToPath } from 'url';

// **** IMPORT FROM VITE's ACTUAL SSR BUILD OUTPUT ****
import { renderPage } from '../dist/ssr.js';
// ********************************************

// **** Assertion Test ****
if (typeof renderPage !== 'function') {
  console.error("\n❌ FATAL ERROR: 'renderPage' function was not found in '../dist/ssr.js'.");
  console.error("   Ensure the 'npm run build:ssr' (using Vite) script ran successfully.");
  process.exit(1); // Exit early if SSR bundle is broken
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(projectRoot, 'dist/public');
const manifestPath = path.resolve(outputDir, '.vite/manifest.json');

// --- Routes to Prerender ---
const routes = [
  '/',
  '/zapchasti',
  '/contact',
];
const brands = [
  { slug: "sitrak", name: "Sitrak" }, { slug: "dfsk", name: "DFSK" },
  { slug: "faw", name: "FAW" }, { slug: "foton", name: "Foton" },
  { slug: "howo", name: "Howo" }, { slug: "jac", name: "JAC" },
];
brands.forEach(brand => { routes.push(`/zapchasti/${brand.slug}`); });

// --- Read Manifest ---
async function readManifest() {
  console.log(`   Attempting to read manifest: ${manifestPath}`);
  try {
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    console.log(`   Successfully read manifest.`);
    return JSON.parse(manifestContent);
  } catch (error) {
    console.error(`\n❌ FATAL ERROR: Failed to read or parse Vite manifest file at ${manifestPath}`);
    console.error(`   Ensure 'npm run build:client' completed successfully and generated '.vite/manifest.json'.`);
    console.error(`   Error details: ${error.message}\n`);
    // Add check if directory exists
    try {
      await fs.access(path.dirname(manifestPath));
      console.log(`   Directory ${path.dirname(manifestPath)} exists.`);
      try {
        await fs.access(manifestPath);
        console.error(`   File exists at ${manifestPath}, but reading/parsing failed.`);
      } catch (accessError) {
        console.error(`   File DOES NOT exist at ${manifestPath}.`);
      }
    } catch (dirError) {
      console.error(`   Directory ${path.dirname(manifestPath)} DOES NOT exist.`);
    }
    throw new Error(`Could not load Vite build manifest from ${manifestPath}`);
  }
}

// --- HTML Template ---
const createHtmlTemplate = (headContent, appHtml, cssPath, jsPath) => {
  const helmet = headContent.helmet || {};
  const { title, meta, link, style, script, bodyAttributes, htmlAttributes } = helmet;
  const faviconLink = `<link rel="icon" type="image/png" href="/favicon.png" />`;
  const formattedCssPath = cssPath ? (cssPath.startsWith('/') ? cssPath : `/${cssPath}`) : '';
  const formattedJsPath = jsPath ? (jsPath.startsWith('/') ? jsPath : `/${jsPath}`) : '';
  const cssLinkTag = formattedCssPath ? `<link rel="stylesheet" href="${formattedCssPath}">` : '';

  if (!formattedJsPath) {
    console.error("❌ FATAL ERROR: JS entry point path could not be determined from manifest for createHtmlTemplate.");
    throw new Error("JS path missing in createHtmlTemplate");
  }

  return `<!DOCTYPE html>
<html lang="ru" ${htmlAttributes?.toString() || ''}>
  <head>
    <meta charset="UTF-8" />
    ${faviconLink}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${title?.toString() || '<title>Asiatek</title>'}
    ${meta?.toString() || ''}
    ${link?.toString() || ''}
    ${cssLinkTag}
    ${style?.toString() || ''}
    ${script?.toString() || ''}
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#ffffff">
  </head>
  <body ${bodyAttributes?.toString() || ''}>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">${appHtml}</div>
    <script type="module" src="${formattedJsPath}"></script>
  </body>
</html>`;
};


// --- Render Loop ---
async function generatePages(routesToRender, baseOutputDir, manifestData) {
  console.log('⚡ Starting page generation...');
  let successCount = 0; let errorCount = 0;

  let entryPointKey = null;
  let entryChunk = null;

  // Find entry point robustly
  for (const key in manifestData) {
    if (manifestData[key].isEntry) {
      entryPointKey = key;
      entryChunk = manifestData[key];
      console.log(`   Found entry point via 'isEntry: true': '${entryPointKey}'`);
      break;
    }
  }
  if (!entryChunk) {
    console.warn(`   Could not find entry point via 'isEntry' flag. Checking common entry keys...`);
    const commonEntryKeys = ['index.html', 'client/index.html', 'client/main.tsx', 'src/main.tsx'];
    entryPointKey = commonEntryKeys.find(key => manifestData[key]);
    if (entryPointKey) {
      entryChunk = manifestData[entryPointKey];
      console.log(`   Found potential entry point via common key: '${entryPointKey}'`);
    }
  }
  if (!entryChunk) {
    console.error(`\n❌ FATAL ERROR: Could not find the main entry point chunk in the manifest file (${manifestPath}).`);
    console.error(`   Manifest content keys: ${JSON.stringify(Object.keys(manifestData))}`);
    throw new Error(`Could not determine entry point from manifest.`);
  }

  // Extract JS path
  const jsPath = entryChunk.file;
  if (!jsPath) {
    console.error(`❌ FATAL ERROR: Could not determine JS file path for entry point '${entryPointKey}' from manifest chunk:`, entryChunk);
    throw new Error("Could not determine JS path from manifest");
  }
  console.log(`   Using JS path from manifest ('${entryPointKey}'): /${jsPath}`);

  // Extract CSS path
  let cssPath = entryChunk.css?.[0];
  if (cssPath) {
    console.log(`   Found CSS directly associated with entry '${entryPointKey}': /${cssPath}`);
  } else {
    console.warn(`   No direct CSS found for entry '${entryPointKey}'. Searching manifest for any CSS file...`);
    for (const key in manifestData) {
      if (key.endsWith('.css') && manifestData[key]?.file) {
        cssPath = manifestData[key].file;
        console.warn(`   Found potential fallback CSS chunk '${key}': /${cssPath}`);
        break;
      }
      if (manifestData[key]?.css?.[0]) {
        cssPath = manifestData[key].css[0];
        console.warn(`   Found potential fallback CSS from chunk '${key}': /${cssPath}`);
        break;
      }
    }
  }
  if (cssPath) {
    console.log(`   Using CSS path: /${cssPath}`);
  } else {
    console.warn(`   ⚠️ WARNING: Could not find any associated CSS file in manifest.`);
  }


  // Render pages
  for (const route of routesToRender) {
    console.log(`   Rendering route: ${route}`);
    try {
      const { html: appHtml, head: helmetContext } = await renderPage(route);
      const fullHtml = createHtmlTemplate(helmetContext, appHtml, cssPath, jsPath); // Pass paths directly
      const routePath = route.startsWith('/') && route !== '/' ? route.substring(1) : route;
      const outputPath = path.join(baseOutputDir, routePath === '/' ? '' : routePath, 'index.html');

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, fullHtml);
      console.log(`     ✅ Generated: ${path.relative(projectRoot, outputPath)}`);
      successCount++;
    } catch (error) {
      console.error(`     ❌ Failed to render route ${route}. Error: ${error.stack || error}`);
      errorCount++;
    }
  }
  console.log(`🏁 Page generation finished. ${successCount} success, ${errorCount} errors.`);
  if (errorCount > 0) {
    console.error("   Prerendering completed with errors during page generation.");
    // Optionally exit here if any page fails
    // process.exit(1);
  }
}

// --- Generate Sitemap ---
async function generateSitemap(sitemapRoutes, baseUrl, baseOutputDir) {
  console.log('🔨 Generating sitemap...');
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  sitemapRoutes.forEach(route => {
    const depth = route.split('/').filter(Boolean).length;
    let priority = 1.0 - depth * 0.1;
    if (priority < 0.5) priority = 0.5;
    if (route === '/') priority = 1.0;
    const loc = `${baseUrl}${route.endsWith('/') && route !== '/' ? route : (route + '/')}`; // Ensure trailing slash for directories
    sitemapContent += `\n  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority.toFixed(1)}</priority><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`;
  });
  sitemapContent += '\n</urlset>';
  const sitemapPath = path.join(baseOutputDir, 'sitemap.xml');
  try {
    await fs.writeFile(sitemapPath, sitemapContent);
    console.log(`✅ Sitemap generated: ${path.relative(projectRoot, sitemapPath)}`);
  } catch (error) {
    console.error(`❌ Failed to generate sitemap:`, error);
  }
}

// --- Generate robots.txt ---
async function generateRobotsTxt(baseOutputDir, siteBaseUrl) {
  console.log('🔨 Generating robots.txt...');
  const robotsDestPath = path.join(baseOutputDir, 'robots.txt');
  const robotsTxtContent = `# Allow all friendly crawlers
User-agent: *
Allow: /

# Disallow backend/auth/user-specific areas
Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/

# Specific instructions for Yandex (optional)
User-agent: Yandex
Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/

# Sitemap location
Sitemap: ${siteBaseUrl}/sitemap.xml
`;
  try {
    await fs.writeFile(robotsDestPath, robotsTxtContent);
    console.log(`✅ Default robots.txt generated: ${path.relative(projectRoot, robotsDestPath)}`);
  } catch (error) {
    console.error(`❌ Failed to generate robots.txt:`, error);
  }
}

// --- Main Execution ---
const siteBaseUrl = 'https://asiatek.pro';
async function main() {
  try {
    console.log('🚀 Starting prerendering process...');
    console.log(`   Project Root: ${projectRoot}`);
    console.log(`   Output Directory: ${outputDir}`);

    // 1. Read Manifest
    const manifestData = await readManifest();

    // 2. Generate Pages
    await generatePages(routes, outputDir, manifestData);

    // 3. Generate Sitemap
    await generateSitemap(routes, siteBaseUrl, outputDir);

    // 4. Generate robots.txt
    await generateRobotsTxt(outputDir, siteBaseUrl);

    // 5. --- ADD FAIL-HARD CHECK ---
    console.log('🔍 Verifying essential prerendered file...');
    const finalIndexPath = path.join(outputDir, 'index.html');
    try {
      // Using fs/promises version of access
      await fs.access(finalIndexPath, fs.constants.F_OK);
      console.log(`   ✅ Prerendered index.html confirmed exists at: ${finalIndexPath}`);
    } catch (indexCheckError) {
      console.error(`❌ Prerender check FAILED - dist/public/index.html is missing after generation!`);
      console.error(`   Expected path: ${finalIndexPath}`);
      console.error(`   Error details: ${indexCheckError}`);
      process.exit(1); // Exit with error code, preventing successful build
    }
    // --- END FAIL-HARD CHECK ---

    console.log('\n🎉 Prerendering tasks complete!');
  } catch (err) {
    console.error("\n💥 An unexpected error occurred during the prerendering main execution:", err.stack || err);
    process.exit(1); // Ensure script exits on any uncaught error
  }
}

// --- Start the process ---
main();