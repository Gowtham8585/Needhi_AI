import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost",
    port: 8080,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssMinify: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf-vendor": ["pdfjs-dist"],
          "ocr-vendor": ["tesseract.js"],
          "ui-vendor": [
            "lucide-react",
            "framer-motion",
            "recharts",
            "embla-carousel-react",
          ],
          "react-vendor": ["react", "react-dom"],
        },
      },
    },
  },
});
