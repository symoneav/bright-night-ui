import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts", "./src/test/mock-leaflet.tsx"],
    include: [
      "src/lib/__tests__/**/*.test.ts",
      "src/components/**/__tests__/**/*.test.tsx",
    ],
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
