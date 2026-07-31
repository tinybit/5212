import path from "node:path";
import { fileURLToPath } from "node:url";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const classicOfflineScript = {
  name: "screensaver:classic-offline-script",
  transformIndexHtml: {
    order: "post" as const,
    handler(html: string) {
      return html
        .replace('<script type="module" crossorigin src="', '<script defer src="')
        .replaceAll(" crossorigin", "");
    },
  },
};

export default defineConfig({
  base: "./",
  root: path.join(rootDir, "screensaver"),
  publicDir: path.join(rootDir, "public"),
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
  plugins: [tailwindcss(), viteReact(), classicOfflineScript],
  build: {
    emptyOutDir: true,
    outDir: path.join(rootDir, "dist-screensaver"),
  },
});
