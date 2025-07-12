// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  esbuild: {
    loader: "tsx",
    include: [
      "server/**/*.ts",
      "server/**/*.tsx",
      "client/src/**/*.ts",
      "client/src/**/*.tsx",
      "shared/**/*.ts",
      "shared/**/*.tsx",
    ],
    exclude: [],
  },
  build: {
    ssr: "server/ssr.ts",
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    copyPublicDir: false,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: "ssr.js",
        format: "esm",
      },
    },
  },
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
  },
});
