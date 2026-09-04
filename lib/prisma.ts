import { PrismaClient } from "@prisma/client";

/**
 * Satu-satunya koneksi database untuk seluruh aplikasi.
 *
 * Kenapa disimpan di `globalThis`? Di mode development, Next.js memuat ulang
 * modul setiap kali file berubah. Kalau `new PrismaClient()` dipanggil di
 * setiap pemuatan, jumlah koneksi ke Postgres terus bertambah sampai ditolak.
 * Menyimpannya di `globalThis` membuat instance yang sama dipakai lagi.
 *
 * Di production modulnya hanya dimuat sekali, jadi trik ini tidak diperlukan —
 * karena itu barisnya dibatasi ke non-production.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
