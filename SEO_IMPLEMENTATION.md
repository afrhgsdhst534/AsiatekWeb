# SEO Implementation for Asiatek.pro

This document outlines the SEO implementation strategy for Asiatek.pro, which uses a hybrid approach to serve prerendered HTML to search engines while delivering a dynamic React application to regular users.

## Architecture

### 1. Hybrid Rendering Approach

The site uses a hybrid approach:
- **Dynamic React Application**: Regular users get the full interactive SPA
- **Prerendered Static HTML**: Search engines and crawlers get static HTML with all metadata

### 2. Key Components

#### Client-Side
- **react-helmet-async**: Manages all meta tags, structured data, and other SEO elements
- **SEO Components**: 
  - `Seo.tsx`: Core component for standard meta tags
  - `LocalBusinessLD.tsx`: Structured data for the business
  - `ProductLD.tsx`: Structured data for products
  - `Breadcrumbs.tsx`: Navigation breadcrumbs with structured data
  - `FAQ.tsx`: FAQ structured data

#### Server-Side
- **SEO Middleware**: Detects search engines and serves static HTML
- **SSR Rendering**: Server-side rendering capability for pregeneration
- **Prerendering Script**: Generates static HTML during build process

## How It Works

1. **Build Time**: 
   - The `fixed-build.sh` script runs the standard Vite build
   - Then it executes the prerendering script that generates static HTML for key routes
   - Each HTML file includes all necessary meta tags and structured data

2. **Runtime**:
   - The `seo-middleware.ts` detects if the request is from a search engine
   - For search engines, it serves the prerendered static HTML
   - For regular users, it passes the request to the SPA

## Structured Data Implementation

The site implements these Schema.org types:
- `AutoPartsStore`: Business information
- `Product`: Auto parts details
- `BreadcrumbList`: Navigation path
- `FAQPage`: Frequently asked questions

## Prerendered Routes

These routes are prerendered for SEO:
- Home page (`/`)
- Brand catalog (`/zapchasti`)
- Individual brand pages (`/zapchasti/{brand}`)
- Contact page (`/contact`)

## SEO Features

1. **Metadata**:
   - Standard HTML meta tags
   - Open Graph tags for social sharing
   - Twitter Card tags
   - Canonical URLs

2. **Structured Data**:
   - JSON-LD format for rich search results
   - Nested entities with proper relationships

3. **Technical SEO**:
   - Automatic sitemap generation
   - robots.txt with proper rules
   - Fast loading static HTML for search engines

## Maintenance

When adding new pages that should be indexed:
1. Add the route to the `routes` array in `scripts/generate-prerendered.mjs`
2. Add the route to the `seoRoutes` array in `server/middleware/seo-middleware.ts`
3. Ensure the page uses the `<Seo>` component with proper metadata

## Testing

To test the SEO implementation:
1. Visit any page with `?seo=true` query parameter to see the static version
2. Validate structured data using Google's Rich Results Test
3. Check the source HTML to ensure all metadata is present