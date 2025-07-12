#!/bin/bash
# Ensure script exits immediately if a command fails
set -e

echo "🚀 Starting Asiatek Production Build..."

echo "🧹 [1/5] Cleaning previous build..."
# Use rimraf installed as a dev dependency
node_modules/.bin/rimraf dist
# *** ADD THIS LINE: Recreate the base dist directory ***
mkdir -p dist # Ensure the parent dist directory exists

echo "🔨 [2/5] Building client assets with Vite..."
# Assumes vite builds to dist/public as per vite.config.ts
npm run build:client
EXIT_CODE=$? # Capture Vite's exit code

# --- Add Debugging ---
echo "👀 Checking filesystem state immediately after Vite build..."
ls -la dist/ # List contents of dist/
ls -la dist/public/ # List contents of dist/public/
ls -la dist/public/assets/ # List contents of dist/public/assets/
# --- End Debugging ---

# Check if Vite exited successfully AND the directory exists
if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Critical Error: 'npm run build:client' failed with exit code $EXIT_CODE."
  exit 1
fi

# This check should now pass because dist/ exists and Vite created dist/public/assets
if [ ! -d "dist/public/assets" ]; then
  echo "❌ Critical Error: Client assets directory 'dist/public/assets' not found after 'npm run build:client', even though Vite exited successfully."
  echo "   Check 'vite.config.ts' build.outDir and review the 'ls' output above."
  exit 1
fi
echo "✅ Client assets directory found."


echo "⚙️ [3/5] Building production server..."
npm run build:server # Uses scripts/build-server.mjs

# Verify server build output exists
if [ ! -f "dist/index.js" ]; then
  echo "❌ Critical Error: Server entry point 'dist/index.js' not found after 'npm run build:server'."
  exit 1
fi
echo "✅ Server entry point found."

echo "⚡ [4/5] Generating prerendered HTML pages..."
npm run build:prerender # Uses scripts/generate-prerendered.mjs

echo "📦 [5/5] Copying essential public files..."
# Copy specific files from client/public to dist/public
cp client/public/manifest.json dist/public/ 2>/dev/null || echo "  manifest.json not found in client/public"
cp client/public/sw.js dist/public/ 2>/dev/null || echo "  sw.js not found in client/public"
# Copy common icons/images - adjust pattern if needed
cp client/public/*.png dist/public/ 2>/dev/null || :
cp client/public/*.svg dist/public/ 2>/dev/null || :
cp client/public/*.ico dist/public/ 2>/dev/null || :

echo "✅ Build completed successfully!"
echo "   Static files served from: dist/public"
echo "   Server entry point: dist/index.js"
echo "   To start server: NODE_ENV=production node dist/index.js"