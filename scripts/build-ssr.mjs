// scripts/build-ssr.mjs
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('Building SSR entry (ssr.ts - BUNDLING react-helmet-async)...');

try {
  await esbuild.build({
    entryPoints: [path.resolve(projectRoot, 'server', 'ssr.ts')],
    bundle: true,
    outfile: path.resolve(projectRoot, 'dist', 'ssr.mjs'), // Output .mjs
    platform: 'node',
    format: 'esm',
    target: 'node20',
    jsx: 'automatic',
    mainFields: ['module', 'main'],
    tsconfig: path.resolve(projectRoot, 'tsconfig.json'),
    loader: { /* Keep loaders as is */
      '.ts': 'tsx',
      '.tsx': 'tsx',
      '.css': 'empty',
      '.scss': 'empty',
      '.png': 'file', '.jpg': 'file', '.jpeg': 'file', '.gif': 'file', '.svg': 'file', '.webp': 'file',
    },
    sourcemap: true,
    logLevel: 'info',
    absWorkingDir: projectRoot,

    // --- Externalize Core Libraries BUT NOT react-helmet-async ---
    external: [
      'react',
      'react-dom',
      'react-dom/server',
      // 'react-helmet-async', // <-- REMOVED FROM EXTERNALS
      'wouter',
      '@tanstack/react-query',
    ],
  });

  console.log('SSR build successful (ssr.ts - BUNDLED react-helmet-async). Output: dist/ssr.mjs');

} catch (error) {
  console.error('SSR build failed (ssr.ts - BUNDLING react-helmet-async):', error);
  process.exit(1);
}