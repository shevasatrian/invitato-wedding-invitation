import { describe, expect, it } from "vitest";

import { rsvpSchema, toFieldErrors, wishSchema } from "@/lib/schemas";

/**
 * Aturan validasi hanya ditulis sekali di `lib/schemas.ts`, lalu dipakai
 * browser DAN server. Karena itu test di file ini bernilai ganda: sekali
 * lolos, kedua sisi ikut terjamin.
 */

describe("rsvpSchema", () => {
  it("menerima isian yang benar dan membuang spasi berlebih pada nama", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "  Budi Santoso  ",
      attendance: "ATTENDING",
      guestCount: 2,
    });

    expect(hasil.success).toBe(true);
    expect(hasil.data?.guestName).toBe("Budi Santoso");
  });

  it("mengubah jumlah orang dari teks jadi angka", () => {
    // <input type="number"> tetap mengirim string. Inilah gunanya z.coerce.
    const hasil = rsvpSchema.safeParse({
      guestName: "Budi Santoso",
      attendance: "ATTENDING",
      guestCount: "3",
    });

    expect(hasil.success).toBe(true);
    expect(hasil.data?.guestCount).toBe(3);
  });

  it("menolak nama yang terlalu pendek", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "B",
      attendance: "ATTENDING",
      guestCount: 1,
    });

    expect(hasil.success).toBe(false);
    expect(toFieldErrors(hasil.error!).guestName).toBe("Nama minimal 2 karakter");
  });

  it("menolak nama lebih dari 80 karakter", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "a".repeat(81),
      attendance: "ATTENDING",
      guestCount: 1,
    });

    expect(hasil.success).toBe(false);
  });

  it("menolak status kehadiran yang belum dipilih", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "Budi Santoso",
      attendance: "",
      guestCount: 1,
    });

    expect(hasil.success).toBe(false);
    expect(toFieldErrors(hasil.error!).attendance).toBe(
      "Silakan pilih status kehadiran",
    );
  });

  it("menolak 'hadir' tanpa satu pun orang — aturan lintas-field", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "Budi Santoso",
      attendance: "ATTENDING",
      guestCount: 0,
    });

    expect(hasil.success).toBe(false);
    // Errornya sengaja ditempelkan ke guestCount, bukan ke form secara umum,
    // supaya pesannya muncul tepat di bawah isian yang salah.
    expect(toFieldErrors(hasil.error!).guestCount).toBe(
      "Jumlah orang minimal 1 jika Anda hadir",
    );
  });

  it("membolehkan 0 orang kalau memang berhalangan", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "Siti Rahayu",
      attendance: "NOT_ATTENDING",
      guestCount: 0,
    });

    expect(hasil.success).toBe(true);
  });

  it("menolak lebih dari 10 orang", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "Budi Santoso",
      attendance: "ATTENDING",
      guestCount: 11,
    });

    expect(hasil.success).toBe(false);
    expect(toFieldErrors(hasil.error!).guestCount).toBe("Maksimal 10 orang");
  });

  it("menolak jumlah orang berupa pecahan", () => {
    const hasil = rsvpSchema.safeParse({
      guestName: "Budi Santoso",
      attendance: "ATTENDING",
      guestCount: 2.5,
    });

    expect(hasil.success).toBe(false);
  });

  it("menolak body yang bukan objek sama sekali", () => {
    // Ini yang terjadi kalau seseorang mengirim POST tanpa body JSON.
    expect(rsvpSchema.safeParse(null).success).toBe(false);
  });
});

describe("wishSchema", () => {
  it("menerima ucapan yang wajar", () => {
    const hasil = wishSchema.safeParse({
      name: "Rani Wijaya",
      message: "Selamat menempuh hidup baru!",
    });

    expect(hasil.success).toBe(true);
  });

  it("menolak pesan yang terlalu pendek", () => {
    const hasil = wishSchema.safeParse({ name: "Rani Wijaya", message: "hi" });

    expect(hasil.success).toBe(false);
    expect(toFieldErrors(hasil.error!).message).toBe("Pesan minimal 3 karakter");
  });

  it("menerima pesan tepat 500 karakter, menolak yang 501", () => {
    const nama = { name: "Rani Wijaya" };

    expect(
      wishSchema.safeParse({ ...nama, message: "a".repeat(500) }).success,
    ).toBe(true);
    expect(
      wishSchema.safeParse({ ...nama, message: "a".repeat(501) }).success,
    ).toBe(false);
  });

  it("menolak pesan yang isinya hanya spasi", () => {
    // Dipangkas dulu baru diukur, jadi "   " dihitung 0 karakter.
    expect(
      wishSchema.safeParse({ name: "Rani Wijaya", message: "   " }).success,
    ).toBe(false);
  });
});

describe("toFieldErrors", () => {
  it("mengumpulkan pesan error per nama field", () => {
    const hasil = wishSchema.safeParse({ name: "R", message: "h" });

    expect(toFieldErrors(hasil.error!)).toEqual({
      name: "Nama minimal 2 karakter",
      message: "Pesan minimal 3 karakter",
    });
  });

  it("hanya menyimpan error pertama tiap field, bukan menumpuknya", () => {
    // Nama kosong melanggar dua aturan sekaligus; yang ditampilkan ke tamu
    // cukup satu, supaya tidak terbaca seperti daftar keluhan.
    const hasil = rsvpSchema.safeParse({
      guestName: "",
      attendance: "ATTENDING",
      guestCount: 1,
    });
    const errors = toFieldErrors(hasil.error!);

    expect(Object.keys(errors)).toEqual(["guestName"]);
    expect(typeof errors.guestName).toBe("string");
  });
});
