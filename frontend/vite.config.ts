import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import content from "../backend/content.json";

// Same-origin API requests keep local development free of CORS configuration.
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/CeciliaTipping/" : "/",
  plugins: [react(), ...(mode === "pages" ? [{
    name: "export-portfolio-content",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "portfolio.json", source: JSON.stringify(content) });
    },
  } satisfies import("vite").Plugin] : [])],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:5001" },
  },
}));
