# Asiatek.pro - Truck Parts Web Platform

## SEO Implementation Guide

This project implements a hybrid rendering approach for improved SEO:
- Dynamic React application for regular users
- Prerendered static HTML for search engines and crawlers

### Key Features

- **Hybrid Rendering**: Dynamically serves different content to search engines vs. regular users
- **Structured Data**: Includes schema.org markup for rich search results
- **Meta Tags**: Proper title, description, open graph tags for social sharing
- **Static Generation**: Prerendered HTML files for important routes
- **Search Engine Detection**: Identifies and serves optimized content to crawlers

### File Structure

- `server/middleware/seo-middleware.ts` - Detects search engines and serves static content
- `scripts/manual-generate.js` - Generates static HTML files with SEO elements
- `client/src/lib/ssg-helpers.ts` - Utilities for static site generation
- `server/ssr.ts` - Server-side rendering implementation

### Build and Deploy

1. **Generate SEO Files Only**:
   ```
   node scripts/manual-generate.js
   ```

2. **Complete Build (Fixed)**:
   ```
   sh scripts/fixed-build.sh
   ```
   This script:
   - Generates static HTML files for SEO
   - Builds client assets with Vite
   - Builds the server with esbuild
   - Organizes all files in the correct dist folder structure

3. **Run Production Server**:
   ```
   NODE_ENV=production node dist/index.js
   ```

### SEO Testing

To test the SEO implementation:

1. Use the Google search console mobile-friendly test
2. Test with search engine user agents:
   ```
   curl -s -A "Googlebot" "http://localhost:5000/"
   ```
3. Check structured data with Google's Rich Results Test tool

### Notes

- The project avoids using vite-plugin-ssg which is not available
- Static HTML is generated manually for maximum control
- All key routes have proper meta tags and structured data
- Sitemap.xml and robots.txt are configured for optimal crawling