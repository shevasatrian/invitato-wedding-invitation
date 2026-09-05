import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { toFieldErrors, wishSchema } from "@/lib/schemas";
import { dictionaries } from "@/lib/i18n";

/**
 * Endpoint ucapan & doa. Bentuknya sengaja dibuat sama persis dengan
 * `app/api/rsvp/route.ts`: try/catch -> safeParse -> Prisma -> NextResponse.
 *
 * POST /api/wishes -> menyimpan satu ucapan
 * GET  /api/wishes -> 100 ucapan terbaru
 */

/** Daftar ucapan tidak pernah dipotong halaman; 100 terbaru sudah cukup. */
const MAX_WISHES = 100;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Pesan server sengaja tetap satu bahasa: tamu tidak pernah melihatnya,
    // karena browser sudah memvalidasi lebih dulu dengan aturan yang sama.
    // Yang sampai ke sini hanya kiriman yang melewati browser, misalnya curl.
    const parsed = wishSchema(dictionaries.id.errors).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ucapan belum bisa dikirim. Periksa kembali isiannya.",
          fieldErrors: toFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const wish = await prisma.wish.create({ data: parsed.data });

    return NextResponse.json({ data: wish }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wishes gagal:", error);
    return NextResponse.json(
      { error: "Gagal mengirim ucapan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const wishes = await prisma.wish.findMany({
      orderBy: { createdAt: "desc" },
      take: MAX_WISHES,
    });

    return NextResponse.json({ data: wishes });
  } catch (error) {
    console.error("GET /api/wishes gagal:", error);
    return NextResponse.json(
      { error: "Gagal memuat ucapan." },
      { status: 500 },
    );
  }
}
