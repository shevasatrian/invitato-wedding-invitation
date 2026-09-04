import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test route handler tanpa menyentuh database.
 *
 * `vi.mock` mengganti modul `@/lib/prisma` dengan tiruan: `prisma.rsvp.create`
 * di sini bukan query sungguhan, melainkan fungsi palsu yang mencatat argumen
 * apa saja yang diterimanya. Jadi kita bisa memeriksa **apa yang hendak
 * disimpan server** — bagian yang paling penting — tanpa Postgres, tanpa
 * koneksi jaringan, dan tanpa meninggalkan sampah data.
 */
vi.mock("@/lib/prisma", () => ({
  prisma: {
    rsvp: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/rsvp/route";

const create = vi.mocked(prisma.rsvp.create);

/** Membuat request POST seperti yang dikirim browser. */
function postRequest(body: unknown) {
  return new Request("http://localhost/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({
    id: "id-palsu",
    guestName: "Budi Santoso",
    attendance: "ATTENDING",
    guestCount: 2,
    createdAt: new Date("2026-09-04T10:00:00Z"),
  });
});

describe("POST /api/rsvp", () => {
  it("menyimpan isian yang valid dan menjawab 201", async () => {
    const response = await POST(
      postRequest({
        guestName: "Budi Santoso",
        attendance: "ATTENDING",
        guestCount: 2,
      }),
    );

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].data).toMatchObject({
      guestName: "Budi Santoso",
      attendance: "ATTENDING",
      guestCount: 2,
    });
  });

  it("memaksa jumlah orang jadi 0 untuk yang berhalangan, walau client mengirim angka lain", async () => {
    // Inilah alasan validasi tidak boleh berhenti di browser: request seperti
    // ini gampang dibuat dengan curl, melewati form sepenuhnya.
    await POST(
      postRequest({
        guestName: "Siti Rahayu",
        attendance: "NOT_ATTENDING",
        guestCount: 9,
      }),
    );

    expect(create.mock.calls[0][0].data.guestCount).toBe(0);
  });

  it("menolak isian tidak valid dengan 400 dan tidak menyentuh database", async () => {
    const response = await POST(
      postRequest({ guestName: "B", attendance: "ATTENDING", guestCount: 1 }),
    );
    const json = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string>;
    };

    expect(response.status).toBe(400);
    expect(json.fieldErrors.guestName).toBe("Nama minimal 2 karakter");
    expect(create).not.toHaveBeenCalled();
  });

  it("menolak 'hadir' dengan 0 orang", async () => {
    const response = await POST(
      postRequest({
        guestName: "Budi Santoso",
        attendance: "ATTENDING",
        guestCount: 0,
      }),
    );
    const json = (await response.json()) as {
      fieldErrors: Record<string, string>;
    };

    expect(response.status).toBe(400);
    expect(json.fieldErrors.guestCount).toBe(
      "Jumlah orang minimal 1 jika Anda hadir",
    );
  });

  it("menjawab 400, bukan 500, kalau body-nya bukan JSON", async () => {
    const response = await POST(postRequest("ini-bukan-json"));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("menjawab 500 kalau database bermasalah, tanpa membocorkan detailnya", async () => {
    create.mockRejectedValue(new Error("connection refused ke host rahasia"));

    const response = await POST(
      postRequest({
        guestName: "Budi Santoso",
        attendance: "ATTENDING",
        guestCount: 2,
      }),
    );
    const json = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    // Pesan teknis tetap di log server; tamu hanya melihat kalimat biasa.
    expect(json.error).not.toContain("connection refused");
  });
});
