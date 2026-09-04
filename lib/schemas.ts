import { z } from "zod";

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

export const rsvpSchema = z
  .object({
    guestName: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter")
      .max(80, "Nama maksimal 80 karakter"),

    attendance: z.enum(ATTENDANCE, {
      message: "Silakan pilih status kehadiran",
    }),

    // z.coerce karena <input type="number"> selalu mengirim string.
    guestCount: z.coerce
      .number()
      .int("Jumlah orang harus bilangan bulat")
      .min(0)
      .max(10, "Maksimal 10 orang"),
  })
  // Aturan lintas-field: kalau hadir, jumlah orang minimal 1.
  .refine((data) => data.attendance !== "ATTENDING" || data.guestCount >= 1, {
    message: "Jumlah orang minimal 1 jika Anda hadir",
    path: ["guestCount"],
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const wishSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama maksimal 80 karakter"),

  message: z
    .string()
    .trim()
    .min(3, "Pesan minimal 3 karakter")
    .max(500, "Pesan maksimal 500 karakter"),
});

export type WishInput = z.infer<typeof wishSchema>;

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
