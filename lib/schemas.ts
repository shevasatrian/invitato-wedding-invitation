import { z } from "zod";

import type { Dict } from "@/lib/i18n";

/** Pesan error yang ditampilkan ke tamu, diambil dari kamus bahasa. */
type Messages = Dict["errors"];

/**
 * Aturan validasi RSVP dan Wishes.
 *
 * File ini dipakai DUA KALI:
 *   1. di browser, saat tombol Submit ditekan  -> user langsung tahu kalau ada yang salah
 *   2. di server, di dalam route handler        -> server tidak pernah percaya client
 *
 * Karena aturannya hanya ditulis sekali di sini, client dan server tidak
 * mungkin punya definisi "valid" yang berbeda.
 */

export const ATTENDANCE = ["ATTENDING", "NOT_ATTENDING"] as const;
export type AttendanceValue = (typeof ATTENDANCE)[number];

/**
 * Aturannya tetap ditulis sekali di sini. Yang menjadi parameter hanya
 * PESAN-nya, supaya tamu membaca error dalam bahasa yang sedang dipakainya
 * tanpa aturan validasinya ikut bercabang.
 */
export function rsvpSchema(m: Messages) {
  return z
    .object({
      guestName: z.string().trim().min(2, m.nameMin).max(80, m.nameMax),

      attendance: z.enum(ATTENDANCE, { message: m.attendanceRequired }),

      // z.coerce karena <input type="number"> selalu mengirim string.
      guestCount: z.coerce.number().int(m.countInteger).min(0).max(10, m.countMax),
    })
    // Aturan lintas-field: kalau hadir, jumlah orang minimal 1.
    .refine(
      (data) => data.attendance !== "ATTENDING" || data.guestCount >= 1,
      { message: m.countMinWhenAttending, path: ["guestCount"] },
    );
}

export type RsvpInput = z.infer<ReturnType<typeof rsvpSchema>>;

export function wishSchema(m: Messages) {
  return z.object({
    name: z.string().trim().min(2, m.nameMin).max(80, m.nameMax),

    message: z.string().trim().min(3, m.messageMin).max(500, m.messageMax),
  });
}

export type WishInput = z.infer<ReturnType<typeof wishSchema>>;

/**
 * Mengubah error Zod menjadi objek datar { namaField: pesanError }
 * supaya komponen form tinggal membaca `errors.guestName`.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
}
