// FILE: vite.config.ts (Client Build Config - FINAL VERSION)
// Replace the ENTIRE content of your existing CLIENT vite config with this.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths"; // Added for consistency and potential alias use

// Import other necessary plugins if you use them
// Example: import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Good practice to include if using path aliases
    // Add any OTHER plugins you were using back here (e.g., VitePWA(), etc.)
  ].filter(Boolean), // Filter out null plugins if any logic adds them conditionally

  resolve: {
    // Keep your existing aliases - tsconfigPaths() often handles this automatically
    // if configured in tsconfig.json, but explicit is fine too.
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Set the root of your client-side source code
  root: path.resolve(import.meta.dirname, "client"),

  // Base URL for assets - '/' is usually correct
  base: "/",

  build: {
    // Output directory relative to the PROJECT ROOT
    // path.resolve ensures it's an absolute path from the project root directory
    outDir: path.resolve(import.meta.dirname, "dist/public"),

    // --- THIS IS THE KEY CHANGE ---
    manifest: true, // Set this to true to generate the manifest file
    // --- END KEY CHANGE ---

    emptyOutDir: true, // Cleans the output directory before build

    // Optional: Rollup options if needed for specific chunking/naming,
    // but usually default hashing is fine. Remove if not needed.
    // rollupOptions: {
    //   output: {
    //     entryFileNames: `assets/[name]-[hash].js`, // Default Vite naming
    //     chunkFileNames: `assets/[name]-[hash].js`, // Default Vite naming
    //     assetFileNames: `assets/[name]-[hash].[ext]` // Default Vite naming
    //   }
    // }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all', // This allows all hosts to access your development server
  },
});
