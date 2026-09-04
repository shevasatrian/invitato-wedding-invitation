import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Konfigurasi test.
 *
 * Isinya cuma satu hal: memberi tahu Vitest arti `@/` di dalam import,
 * supaya `import { prisma } from "@/lib/prisma"` di file test menunjuk ke
 * folder yang sama dengan yang dipakai Next.js (lihat `paths` di tsconfig).
 *
 * `fileURLToPath` dipakai, bukan `__dirname`, karena file ini berjalan
 * sebagai ES module — dan hasilnya tetap benar di Windows.
 *
 * Ekstensinya `.mts`, bukan `.ts`: tanpa itu Vite memuat file ini sebagai
 * CommonJS dan `import.meta` di atas menjadi peringatan.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
