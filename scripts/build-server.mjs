// scripts/build-server.mjs
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
// Plugin import is removed/commented out

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// --- Banner (Keep commented out/removed) ---

console.log('Building server bundle (ssr.ts - Relying on packages: external default)...');

try {
  await esbuild.build({
    entryPoints: {
      index: path.resolve(projectRoot, 'server', 'index.ts'), // Keep index
      // **** TARGETING THE REAL ssr.ts ****
      ssr: path.resolve(projectRoot, 'server', 'ssr.ts')
      // ***********************************
    },
    outdir: path.resolve(projectRoot, 'dist'),
    bundle: true,               // Keep bundling enabled
    platform: 'node',           // Target Node.js
    format: 'esm',              // Output ESM format
    target: 'node20',           // Target Node.js v20
    jsx: 'automatic',           // Need JSX for ssr.ts

    // **** REMOVED packages: 'bundle' - Let it default to external ****

    mainFields: ['module', 'main'], // Keep mainFields
    tsconfig: path.resolve(projectRoot, 'tsconfig.json'), // Point to tsconfig
    plugins: [ /* Keep empty */],
    loader: { // Keep loaders
      '.ts': 'tsx',
      '.tsx': 'tsx',
      '.css': 'empty',
      '.scss': 'empty',
      '.png': 'file', '.jpg': 'file', '.jpeg': 'file', '.gif': 'file', '.svg': 'file', '.webp': 'file',
    },
    sourcemap: true,            // Generate source maps
    logLevel: 'info',           // Set log level
    absWorkingDir: projectRoot, // Set working directory
    external: [
      'wouter' // Keep wouter external for now (might be redundant)
      // Add others ONLY if specific build errors occur for them
    ],
  });

  console.log('Server build successful (ssr.ts - packages: external default).');

} catch (error) {
  console.error('Server build failed (ssr.ts - packages: external default):', error);
  process.exit(1);
}