import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { rsvpSchema, toFieldErrors } from "@/lib/schemas";
import { dictionaries } from "@/lib/i18n";

/**
 * Endpoint konfirmasi kehadiran.
 *
 * File ini berjalan di server (Node), bukan di browser. Kredensial database
 * tidak pernah ikut terbundel ke JavaScript yang diunduh tamu.
 *
 * POST /api/rsvp -> menyimpan satu konfirmasi
 * GET  /api/rsvp -> ringkasan angka untuk ditampilkan di halaman
 */

export async function POST(request: Request) {
  try {
    // `.catch(() => null)` menangani body yang bukan JSON: nilai null pasti
    // gagal di safeParse, jadi jawabannya 400 (salah client), bukan 500.
    const body = await request.json().catch(() => null);

    // Pesan server sengaja tetap satu bahasa: tamu tidak pernah melihatnya,
    // karena browser sudah memvalidasi lebih dulu dengan aturan yang sama.
    // Yang sampai ke sini hanya kiriman yang melewati browser, misalnya curl.
    const parsed = rsvpSchema(dictionaries.id.errors).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data yang dikirim belum lengkap atau tidak valid.",
          fieldErrors: toFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const { guestName, attendance, guestCount } = parsed.data;

    const rsvp = await prisma.rsvp.create({
      data: {
        guestName,
        attendance,
        // Yang menyatakan tidak hadir selalu tercatat 0 orang, apa pun isi
        // form — supaya total tamu tidak ikut menghitung mereka.
        guestCount: attendance === "ATTENDING" ? guestCount : 0,
      },
    });

    return NextResponse.json({ data: rsvp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rsvp gagal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan konfirmasi. Silakan coba lagi." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Dua hitungan dan satu penjumlahan, dikerjakan bersamaan.
    const [attending, notAttending, pax] = await Promise.all([
      prisma.rsvp.count({ where: { attendance: "ATTENDING" } }),
      prisma.rsvp.count({ where: { attendance: "NOT_ATTENDING" } }),
      prisma.rsvp.aggregate({ _sum: { guestCount: true } }),
    ]);

    return NextResponse.json({
      attending,
      notAttending,
      // `_sum` bernilai null selama tabelnya masih kosong.
      totalPax: pax._sum.guestCount ?? 0,
    });
  } catch (error) {
    console.error("GET /api/rsvp gagal:", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan kehadiran." },
      { status: 500 },
    );
  }
}
